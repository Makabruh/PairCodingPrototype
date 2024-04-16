from rest_framework import serializers
from . models import *
from django.contrib.auth import get_user_model, authenticate

# For registering a user
class RegisterSerializer(serializers.ModelSerializer):
    # The serializer for creating a user
    class Meta:
        model = UserInfo
        fields = ['username', 'password', 'userLevel', 'email']

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
    # This is a field not included in UserInfo
    # write_only=True means that it will only be used for deserialization but not for retrieving data
    newPassword = serializers.CharField(write_only=True)

    class Meta:
        model = UserInfo
        fields = ['password', 'newPassword']

class MFA_EmailSerializer(serializers.ModelSerializer):
    request_reason = serializers.CharField(write_only=True)

    class Meta:
        model = UserInfo
        fields = ['email', 'request_reason']
    