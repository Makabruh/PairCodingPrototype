from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from . models import UserInfo
from . serializer import *
from django.contrib.auth import login, logout
from rest_framework.authentication import SessionAuthentication
from rest_framework import permissions, status
from django.contrib.auth.hashers import make_password, check_password
from django.middleware.csrf import get_token
from rest_framework.permissions import IsAuthenticated
from django.core.mail import send_mail
from django.http import JsonResponse
from datetime import datetime, timedelta
import random
import mailslurp_client

# create a mailslurp configuration
configuration = mailslurp_client.Configuration()
configuration.api_key['x-api-key'] = "83257037814353bfb46377ac6a80d96ac32a6e5446bf805a6f3b53913a34aa3f"
with mailslurp_client.ApiClient(configuration) as api_client:
    # create an inbox
    test_inbox_controller = mailslurp_client.InboxControllerApi(api_client)

#from rest_framework_simplejwt.tokens import RefreshToken

def create_session(request, username, userlevel):
    request.session['username'] = username
    request.session['userLevel'] = userlevel

def access_session(request):
    request.session.get('username')

def send_otp_in_mail(user,otp):

    # send email
    #TODO Add try block to cover email failing to send.
    opts = mailslurp_client.SendEmailOptions()
    opts.to = [user.email]
    opts.subject = 'One Time Passcode'
    opts.body = f'Hi {user.username}, here is your OTP for secure login \n Otp is: {otp}'
    opts.is_html = True
    test_inbox_controller.send_email('d155a520-b321-47a5-9443-31c1d85de3b5', send_email_options=opts)


    #! Uses send_mail instead of mailslurp server.
    # subject = 'One Time Passcode'
    # message = f'Hi {user.username}, here is your OTP for secure login \n Otp is: {otp}'
    # email_from = settings.EMAIL_HOST_USER
    # print(email_from)
    # # recipient_list = [user.email, ]
    # recipient_list = ['userpeter-4552-8d4f@mailslurp.mx']
    # send_mail(subject, message, email_from, recipient_list, fail_silently=False)

class ForceCRSFAPIView(APIView):
    @classmethod
    def as_view(cls, **initkwargs):
        # Force enables CSRF protection.  This is needed for unauthenticated API endpoints
        # because DjangoRestFramework relies on SessionAuthentication for CSRF validation
        view = super().as_view(**initkwargs)
        view.csrf_exempt = False
        return view

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
    
class UserLoginAPIView(ForceCRSFAPIView):
    #Also accessed by anyone and uses session authentication
    permission_classes = (permissions.AllowAny,)
    authentication_classes = (SessionAuthentication,)

    def get(self, request):
        # Create the token for login
        csrf_token = get_token(request)
        # On login, it will be consumed and re-issued with the session
        #? Remove the CSRF Token from the response??
        return Response({"csrf_token": csrf_token}, status=status.HTTP_200_OK)

    def post(self, request):
        # Get the username from the data
        username = request.data.get('username')
        # Get the actual user object in order to modify values from the model
        userTest = UserInfo.objects.get(username=username)
        # If a user object is found and the account is not locked
        if userTest.username and userTest.accountLocked == False:
            # Instantiate the serializer
            serializer = LoginSerializer(data=request.data)
            # Check the data format with the serializer
            if serializer.is_valid(raise_exception=True):
                # Call the check_user function within the serializer
                authenticatedUser = serializer.check_user(request.data)
                # Check that there is a user object returned from this function - this will be the authenticated user
                if authenticatedUser:
                    #refresh = RefreshToken.for_user(user)
                    #access_token = str(refresh.access_token)
                    # Use the Django login function that creates a sessionid and token for the frontend and backend
                    login(request, authenticatedUser)
                    # Create a session storing the username and the userLevel within the session
                    create_session(request, username, ["AuthUser", userTest.userLevel])
                    # Reset the Password Attempts Left back to 3 on a successful login
                    userTest.passwordAttemptsLeft = 3
                    userTest.save()
                    # Return the userLevel to the frontend
                    return Response({"userlevel": userTest.userLevel}, status=status.HTTP_200_OK)
                else:
                    # Modify the passwordAttemptsLeft field in the model UserInfo
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
    # We do not want to include 'authentication_classes = (SessionAuthentication,)' here as that will invalidate the session after the transaction
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        verificationCodeBackend = request.session.get('verification')
        verificationCodeFrontend = request.COOKIES.get('accountVerification')
        #Get the current user object
        username = request.session.get('username')

        # Check that the verification codes are the same
        if (verificationCodeBackend == verificationCodeFrontend):
            try:
                # Instantiate the serializer
                serializer = PasswordSerializer(data=request.data)
                newPassword = request.data.get("password")
                userObject = UserInfo.objects.get(username=username)
                #! TODO - This will need to become bcrypt when we switch over
                hashedNewPassword = make_password(newPassword)
                hashedOldPassword = userObject.password
                print(hashedNewPassword)
                print(hashedOldPassword)
                if (hashedNewPassword != hashedOldPassword):
                    userObject.password = hashedNewPassword
                    userObject.accountLocked = False
                    userObject.passwordAttemptsLeft = 3
                    userObject.save()
                    request.session.flush()
                    #TODO Close session here
                    return Response({"message": "Password changed"}, status=status.HTTP_200_OK)
                else:
                    return Response({"message": "Password needs to be new"}, status=status.HTTP_406_NOT_ACCEPTABLE)

            except serializers.ValidationError as e:
                # This can be used to check the errors in the Django server
                print(e.detail)
                #TODO Close session here
                request.session.flush()
                return Response({"message": "Validation error", "errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)
        else:
            #TODO Close session here
            request.session.flush()
            return Response({"message": "Verification Incorrect"}, status=status.HTTP_401_UNAUTHORIZED)


class MFA_Email(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = MFA_EmailSerializer(data=request.data)
        if serializer.is_valid(raise_exception=True):
            #TODO - add in request_reason logic - this will be 'forgotpassword'
            sendEmail = request.data.get('email')
            request_reason = request.data.get('request_reason')

            if request_reason == "forgotpassword":
                # Uses the random library to pick 6 digits from the choices
                generatedOTP = ''.join(random.choices('0123456789', k=6))
                #Find the user with the associated email and save the OTP in the OTP field
                try:
                    user = UserInfo.objects.get(email=sendEmail)
                    user.OTP = generatedOTP
                    user.save()
                    #Save the OTP to the user

                    send_otp_in_mail(user, generatedOTP)

                #If there is no user with this email
                except UserInfo.DoesNotExist:
                    print("user not found")
                    return Response({"message": "No user with this email"}, status=status.HTTP_400_BAD_REQUEST)
            return Response({"message": "Email will be sent", 'username': user.username} , status=status.HTTP_200_OK)
        else:
            print("not valid")
            return Response({"message": "Incorrect data format"}, status=status.HTTP_400_BAD_REQUEST)

class VerifyUser(APIView):
    # We do not want to include 'authentication_classes = (SessionAuthentication,)' here as that will invalidate the session after the transaction
    permission_classes = (permissions.AllowAny,)

    #TODO Could make this more maintainable by introducing a verify function that creates the code and constructs and sends the response
    def post(self, request):
        #Get the current user object
        user = request.user
        #If there is no user - we need to use the OTP method
        #It will return an empty user object on request.user so we need to check if there is a username
        if not user.username:
            # We are going to use the OTPSerializer for the field OTP from the database - it will be a number
            try:
                serializer = OTPSerializer(data=request.data)
                if serializer.is_valid(raise_exception=True):
                    # The user has reached this point by clicking the link in the email which takes them to the VerifyUser component
                    # Therefore the link they clicked contains their username
                    # Check the OTP against the user's OTP in the database
                    otp_input = request.data.get('password')
                    username = request.data.get('username')
                    userObject = UserInfo.objects.get(username=username)
                    otp_in_database = userObject.OTP
                    if not (otp_input == otp_in_database):
                        return Response({"message": "OTP Incorrect"}, status=status.HTTP_400_BAD_REQUEST)
                    # Store a code in the session (for the OTP route, a session will be created)
                    verificationCode = "2201"
                    create_session(request, username, ['VerifiedButNotLogged'])
                    request.session['verification'] = verificationCode
                    response = JsonResponse({"message": "Verified User"}, status=status.HTTP_200_OK)
                    # Set the HTTPOnly cookie with an expiration time of 15 mins
                    expiration_time = datetime.now() + timedelta(minutes=15)
                    response.set_cookie('accountVerification', verificationCode, httponly=True, expires=expiration_time)
                    return response
            except serializers.ValidationError as e:
                # This can be used to check the errors in the Django server
                print(e.detail)
                return Response({"message": "Validation error", "errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)
            
            
        else:
            try:
                # Instantiate the serializer
                serializer = PasswordSerializer(data=request.data)
                # Check the data format with the serializer
                if serializer.is_valid(raise_exception=True):
                    currentPassword = request.data.get('password')
                    passwordInDatabase = user.password
                    username = request.data.get('username')
                    # Check the current details using Django's check_password function (this is needed due to make_password generating a new hash each time)
                    if not check_password(currentPassword, passwordInDatabase):
                        return Response({"message": "Password Incorrect"}, status=status.HTTP_400_BAD_REQUEST)
                    # If logged in, there is no need to return the user
                    # Store a code in the session
                    verificationCode = "2201"
                    request.session['verification'] = verificationCode
                    response = JsonResponse({"message": "Verified User"}, status=status.HTTP_200_OK)
                    # Set the HTTPOnly cookie with an expiration time of 15 mins
                    expiration_time = datetime.now() + timedelta(minutes=15)
                    response.set_cookie('accountVerification', verificationCode, httponly=True, expires=expiration_time)
                    return response
            except serializers.ValidationError as e:
                # This can be used to check the errors in the Django server
                print(e.detail)
                return Response({"message": "Validation error", "errors": e.detail}, status=status.HTTP_400_BAD_REQUEST)

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

    

