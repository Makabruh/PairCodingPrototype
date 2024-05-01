from django.contrib import admin
from django.urls import path
from secure_login.views import *
from rest_framework.routers import DefaultRouter

#!CHANGES
# router = DefaultRouter()
# router.register('trainingprovider', TrainingProviderViewset, basename="trainingprovider")
# urlpatterns = router.urls

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register', UserRegistrationAPIView.as_view(), name="registration"),
    path('login', UserLoginAPIView.as_view(), name="userLogin"),
    path('logout', UserLogout.as_view(), name="userLogout"),
    path('user', UserView.as_view(), name="user"),
    path('restore', RestoreView.as_view(), name="restore"),
    path('passwordreset', PasswordResetView.as_view(), name="passwordreset"),
    path('mfaemail', MFA_Email.as_view(), name="mfaemail"),
    path('verifyuser', VerifyUser.as_view(), name="verifyuser"),
    # TODO Testing remove afterwards
    path('query', QueryView.as_view(), name="query"),
    path('trainingprovider', TrainingProviderViewset.as_view(), name="trainingprovider"),
]
