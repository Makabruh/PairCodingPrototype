from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, RegexValidator

class UserInfoManager(BaseUserManager):
    def create_user(self, username, password=None):
        print("in the userinfomanager")
        if not username:
            raise ValueError('A username is required')
        if not password:
            raise ValueError('A password is required')
        user = self.model(username=username)
        user.set_password(password)
        user.save()
        return user
    def create_superuser(self, username, password=None):
        if not username:
            raise ValueError('A username is required')
        if not password:
            raise ValueError('A password is required')
        user = self.create_user(username, password)
        user.is_superuser = True
        user.save()
        return user

class UserInfo(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=130)
    userLevel = models.CharField(max_length=100)
    #Could make this an email field - TODO
    email = models.CharField(max_length=100, unique=True)
    passwordAttemptsLeft = models.PositiveIntegerField(default = 3, validators=[MaxValueValidator(3)])
    accountLocked = models.BooleanField(default = False)
    #Validator for the OTP ensuring it is 8 digits long
    OTP_validator = RegexValidator(regex=r'^\d{8}$')
    #OTP must be 8 characters, defaults to empty
    OTP = models.CharField(max_length=8, default='111', validators=[OTP_validator], blank=True)
    # This needs to be introduced to manage previous devices but must be able to be null on sign up
    #!authenticatedDevices = models.JSONField()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    # May need this later - from following tutorial
    objects = UserInfoManager()
    def __str__(self):
        return self.username