from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.core.validators import MaxValueValidator

class UserInfo(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=130)
    userLevel = models.CharField(max_length=100)
    email = models.EmailField(max_length=100, unique=True)
    passwordAttemptsLeft = models.PositiveIntegerField(default = 3, validators=[MaxValueValidator(3)])
    authenticatedDevices = models.JSONField()
    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []
    # May need this later - from following tutorial
    # objects = UserInfoManager()
    def __str__(self):
        return self.username