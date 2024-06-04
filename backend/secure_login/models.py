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
    # A total lockout of the account in case of suspicious activity - need admin level access to unblock
    accountPermLocked = models.BooleanField(default = False)
    #Validator for the OTP ensuring it is 6 digits long
    OTP_validator = RegexValidator(regex=r'^\d{6}$')
    #OTP must be 6 characters, defaults to '000001'
    OTP = models.CharField(max_length=6, default='000001', validators=[OTP_validator], blank=True)
    OTPAttemptsLeft = models.PositiveIntegerField(default = 3, validators=[MaxValueValidator(3)])
    OTP_expiry = models.DateTimeField(blank=True, null=True)
    # This needs to be introduced to manage previous devices but must be able to be null on sign up
    #!authenticatedDevices = models.JSONField()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    # May need this later - from following tutorial
    objects = UserInfoManager()

    # #! We now save this concurently in the view
    # def save(self, *args, **kwargs):
    #     super().save(*args, **kwargs)
    #     self.create_profile()

    # def create_profile(self):
    #     UserProfile.objects.create(userinfo=self)

    def __str__(self):
        return self.username
    

class UserProfile(models.Model):
    userinfo = models.OneToOneField(UserInfo,on_delete=models.CASCADE, primary_key=True)
    firstName = models.CharField(max_length=30)
    surname = models.CharField(max_length=30)

    def __str__(self):
        return self.userinfo.username