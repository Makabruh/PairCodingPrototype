# from django.contrib.auth.models import AbstractBaseUser
# from django.dispatch import receiver
# from django.db.models.signals import post_save
# from .models import UserProfile

# @receiver(post_save, sender=AbstractBaseUser)
# def create_user_profile(sender, instance, created, **kwargs):
#     #! Not picking this up
#     print("reaches here")
#     # Automatically creates a UserProfile on User creation.
#     if created:
#         UserProfile.objects.create(user=instance)

# post_save.connect(create_user_profile, sender=AbstractBaseUser)