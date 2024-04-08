from django.contrib import admin
from django.urls import path
from secure_login.views import *

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register', UserRegistrationAPIView.as_view(), name="registration"),
    path('login', UserLoginAPIView.as_view(), name="userLogin"),
    path('logout', UserLogout.as_view(), name="userLogout"),
    path('user', UserView.as_view(), name="user"),
    path('getauth', AuthDetails.as_view(), name="getauth"),
]
