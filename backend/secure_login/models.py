from django.db import models
from django.contrib.auth.base_user import BaseUserManager
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator, RegexValidator, MinLengthValidator

class TrainingProvider(models.Model):
    company_name = models.CharField(max_length=100, unique=True)
    contact_number = models.CharField(max_length=11, blank=True, null=True)
    contact_email = models.EmailField(blank=True, null=True)
    # The standards_offered will be a list of the standards offered by this training provider
    # Eventually this should be a foreign key
    #standards_offered = models.JSONField(blank=True, null=True)
    signup_code = models.CharField(max_length=6, validators=[MinLengthValidator(6)], blank=True, null=True)
    def __str__(self):
        return self.company_name


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

    # The model of the foreign key needs to come above this model
    # CASCADE means if the TrainingProvider record is deleted, the user is deleted - CAREFUL POSSIBLY CHANGE #!
    associated_training_provider = models.ForeignKey(TrainingProvider, on_delete=models.CASCADE, blank=True, null=True)

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    # May need this later - from following tutorial
    objects = UserInfoManager()
    def __str__(self):
        return self.username
    

