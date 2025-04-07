from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Email')
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        # return self.username
        return f"{self.username} ({self.email})"
