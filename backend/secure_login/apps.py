from django.apps import AppConfig


class SecureLoginConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'secure_login'

    # def ready(self):
    #     import secure_login.signals
