from django.db import models
from users.models import User
import secrets
import os
from django.conf import settings


# def user_dir(instance):
#     user_name = instance.user.username
#     return f'user_{user_name}'


class File(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='files')
    file = models.FileField(upload_to='user_files/%Y/%m/%d/')
    # file = models.FileField(upload_to=user_dir)
    name = models.CharField(max_length=255)
    comment = models.TextField(blank=True)
    size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    published = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    is_public = models.BooleanField(default=False)
    link_download = models.CharField(max_length=50, unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.link_download:
            self.link_download = secrets.token_urlsafe(24)
        if not self.name and self.file:
            self.name = os.path.basename(self.file.name)

        # Формирование пути с учетом имени пользователя
        if not self.file.name:
            self.file.name = f"{self.user.username}/{secrets.token_urlsafe(12)}_{os.path.basename(self.file.name)}"

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/api/storage/files/{self.pk}/download/"

    def __str__(self):
        return f"{self.name} ({self.user.username})"
