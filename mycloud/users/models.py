from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    is_authenticated = models.BooleanField(default=True)
    slug = models.SlugField(max_length=250)

    def __str__(self):
        return self.username
