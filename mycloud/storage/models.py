from django.db import models
from django.db.models.functions import Now
from users.models import User

# Create your models here.


class File(models.Model):
    title = models.CharField(max_length=250)
    file = models.FileField(
        upload_to="users/{user.username}", blank=True, null=True, verbose_name='Файл')
    comment = models.TextField(null=True)
    size = models.CharField(null=True)
    link_download = models.CharField(blank=True, null=True)
    # publish = models.DateTimeField(db_default=Now())
    published = models.DateTimeField(auto_now_add=True)
    lastload = models.DateTimeField(auto_now=True)
    slug = models.SlugField(max_length=250)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="files")

    def __str__(self):
        return self.title
