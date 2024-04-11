from rest_framework.views import APIView
from rest_framework.response import Response
from . models import UserInfo
from . serializer import *
from django.contrib.auth import login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework import permissions, status
from django.contrib.auth.hashers import make_password
from django.middleware.csrf import get_token
from rest_framework.permissions import IsAuthenticated

def create_session(request, username, userlevel):
    request.session['username'] = username
    request.session['userLevel'] = userlevel

def access_session(request):
    request.session.get('username')



class UserRegistrationAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    #This view only has a post method as it is registration by creating a user
    def post(self, request):
        #post means that this method handles post requests to the url that calls this view
        
        serializer = RegisterSerializer(data=request.data)
        
        if serializer.is_valid(raise_exception=True):
            #This checks that the data is valid according to the serializer
            
            username = serializer.validated_data.get('username')
            #Get the username from the data
            password = serializer.validated_data.get('password')
            
            if UserInfo.objects.filter(username=username).exists():
                #Check if the username is free against usernames in the database
                return Response({"error": "Username is already taken."}, status=status.HTTP_400_BAD_REQUEST)
            
            #The password needs to be hashed when stored in order to authenticate on login
            hashed_password = make_password(password)
            serializer.validated_data['password'] = hashed_password

            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class UserLoginAPIView(APIView):
    #Also accessed by anyone and uses session authentication
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        # Create the token for login
        csrf_token = get_token(request)
        # Store the token for login purposes
        # On login, it will be consumed and re-issued with the session
        #TODO
        return Response({"csrf_token": csrf_token}, status=status.HTTP_200_OK)

    def post(self, request):
        #Get the username from the data
        username = request.data.get('username')
        #Check the database for the specific user object with unique username & obtain the userLevel
        query = [{
            'username': output.username,
            'userLevel': output.userLevel
            }
            for output in UserInfo.objects.filter(username=username)]
        
        access_level = query[0]["userLevel"]
        user = query[0]["username"]
        # Get the actual user object in order to modify values from the model
        userTest = UserInfo.objects.get(username=username)
        #If a user object is found
        if user and userTest.accountLocked == False:
            #Instantiate the serializer
            serializer = LoginSerializer(data=request.data)
            #Check the data format with the serializer
            if serializer.is_valid(raise_exception=True):
                #Call the check_user function within the serializer
                authenticatedUser = serializer.check_user(request.data)
                # If the account is locked, prevent the login attempt
                # Check that there is a user object returned from this function
                if authenticatedUser:
                    #Create a CSRF token for the user
                    login(request, authenticatedUser)
                    create_session(request, username, ["AnyUser", access_level])
                    #! This token is not used, the login function aready creates a csrf token in cookie form.
                    csrf_token = get_token(request)
                    return Response({"userlevel": access_level, "csrf_token": csrf_token}, status=status.HTTP_200_OK)
                else:
                    # Modify the passwordAttemptsLeft field in the model UserInfo
                    print("Reducing password attempts")
                    userTest.passwordAttemptsLeft -= 1
                    userTest.save()
                    # If the value is 0, lock the account by changing the boolean to True
                    if userTest.passwordAttemptsLeft == 0:
                        userTest.accountLocked = True
                        userTest.save()
                    return Response({"message": "Password does not match"}, status=status.HTTP_401_UNAUTHORIZED)
            else:
                return Response({"message": "Incorrect data format"}, status=status.HTTP_400_BAD_REQUEST)
        elif userTest.accountLocked == True:
            return Response({"message": "Account Locked"}, status=status.HTTP_403_FORBIDDEN)
        else:
            return Response({"message": "Username not in database"}, status=status.HTTP_400_BAD_REQUEST)

class UserLogout(APIView):
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    def post(self, request):
        logout(request)
        return Response(status=status.HTTP_200_OK)

class UserView(APIView):
    # permission_classes = (permissions.AllowAny,)
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    
    def post(self, request):
        serializer = UserSerializer(request.user)
        session_user = request.session.get('username')
        return Response({'user': session_user}, status=status.HTTP_200_OK)
    
class RestoreView(APIView):
    # permission_classes = (permissions.AllowAny,)
    permission_classes = (permissions.IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)
    
    def post(self, request):
        serializer = UserSerializer(request.user)
        session_user = request.session.get('username')
        session_userlevel = request.session.get('userLevel')
        return Response({'user': session_user, 'userlevel': session_userlevel}, status=status.HTTP_200_OK)
    
class PasswordResetView(APIView):
    # Is authenticated means I need to provide csrf token
    permission_classes = (IsAuthenticated,)
    authentication_classes = (SessionAuthentication,)

    def post(self, request):
        #Get the current user object
        user = request.user
        #Fetch the data from the payload
        #TODO - Make a serializer to do this
        username = user.username
        currentPassword = request.data.get('currentPassword')
        newPassword = request.data.get('newPassword')

        # Check the current details
        authenticatedUser = authenticate(username=username, password=currentPassword)
        if not authenticatedUser:
            return Response({"message": "Password Incorrect"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Set the new password
        user.set_password(newPassword)
        user.save()

        return Response({"message": "Password Changed"}, status=status.HTTP_200_OK)


    


# TODO Testing remove afterwards
    
class QueryView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        user = request.data.get('username')
        output = [{
            'username': output.username,
            'userLevel': output.userLevel,
            'email': output.email
            }
            for output in UserInfo.objects.filter(username=user)]
        
        return Response(output[0])

    

