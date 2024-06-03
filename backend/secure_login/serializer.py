from rest_framework import serializers
from . models import *
from django.contrib.auth import get_user_model, authenticate

# For registering a user
class RegisterSerializer(serializers.ModelSerializer):
    # The serializer for creating a user
    class Meta:
        model = UserInfo
        fields = ['username', 'password', 'userLevel', 'email']

# for adding user details to the profile
class UserProfileSerializer(serializers.ModelSerializer):
    #? Needed? user_info = RegisterSerializer(required=False)

    class Meta:
        model = UserProfile
        fields = ['firstName', 'surname']

# combination of the userinfo and userprofile serializers as the data is given in the same POST request
class CombinedSerializer(serializers.Serializer):
    user_info = RegisterSerializer()
    user_profile = UserProfileSerializer()

# For logging in a user
class LoginSerializer(serializers.ModelSerializer):
    # The serializer for logging in a user
    username = serializers.CharField()
    password = serializers.CharField()
    
    class Meta:
        model = UserInfo
        fields = ['username', 'password']

    # Checking the username and password match using the authenticate method (requiring a hashed password)
    def check_user(self, clean_data):
        username = clean_data.get('username')
        password = clean_data.get('password')
        user = authenticate(username=username, password=password)
        if not user:
            print("User not found")
            # TODO Validation errors
            return(None)
            #raise ValidationError('User not found')
        return user
    
# For checking which user is logged in
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['username']

class PasswordSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['username', 'password']
        read_only_fields = ['username']

class MFA_EmailSerializer(serializers.ModelSerializer):
    email = serializers.CharField(write_only=True)
    request_reason = serializers.CharField(write_only=True)

    class Meta:
        model = UserInfo
        fields = ['email', 'request_reason']

class OTPSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserInfo
        fields = ['username', 'OTP']
        read_only_fields = ['username']
    