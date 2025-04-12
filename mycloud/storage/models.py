# from django.db import models
# from users.models import User
# import secrets
# import os


# def user_file_path(instance, filename):
#     # Имя пользователя + уникальный суффикс
#     username = instance.user.username
#     base, ext = os.path.splitext(filename)
#     unique_name = secrets.token_urlsafe(8)
#     return f"user_{username}/{unique_name}_{base}{ext}"


# class File(models.Model):
#     user = models.ForeignKey(
#         User, on_delete=models.CASCADE, related_name='files')
#     # file = models.FileField(upload_to='user_files/%Y/%m/%d/')
#     file = models.FileField(upload_to=user_file_path)
#     name = models.CharField(max_length=255)
#     comment = models.TextField(blank=True)
#     size = models.BigIntegerField()
#     file_type = models.CharField(max_length=50)
#     published = models.DateTimeField(auto_now_add=True)
#     last_download = models.DateTimeField(null=True, blank=True)
#     is_public = models.BooleanField(default=False)
#     link_download = models.CharField(max_length=50, unique=True, blank=True)

#     def save(self, *args, **kwargs):
#         # Проверка на дублирование имени файла у этого пользователя
#         if File.objects.filter(user=self.user, name=self.name).exclude(pk=self.pk).exists():
#             raise ValueError("Файл с таким именем уже существует.")

#         if not self.link_download:
#             self.link_download = secrets.token_urlsafe(24)

#         if not self.name and self.file:
#             self.name = os.path.basename(self.file.name)

#         super().save(*args, **kwargs)

#     # def save(self, *args, **kwargs):
#     #     if not self.link_download:
#     #         self.link_download = secrets.token_urlsafe(24)
#     #     if not self.name and self.file:
#     #         self.name = os.path.basename(self.file.name)

#     #     # Формирование пути с учетом имени пользователя
#     #     if not self.file.name:
#     #         self.file.name = f"{self.user.username}/{secrets.token_urlsafe(12)}_{os.path.basename(self.file.name)}"

#     #     super().save(*args, **kwargs)

#     def get_absolute_url(self):
#         return f"/api/storage/files/{self.pk}/download/"

#     def __str__(self):
#         return f"{self.name} ({self.user.username})"


from django.db import models
from users.models import User
import secrets
import os


def user_directory_path(instance, filename):
    # Создаём путь вида: user_<username>/<уникальное_имя_файла>
    unique_name = secrets.token_urlsafe(8)
    base_name = os.path.basename(filename)
    return f'user_{instance.user.username}/{unique_name}_{base_name}'


class File(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='files'
    )
    file = models.FileField(upload_to=user_directory_path)
    name = models.CharField(max_length=255, unique=True)
    comment = models.TextField(blank=True)
    size = models.BigIntegerField()
    file_type = models.CharField(max_length=50)
    published = models.DateTimeField(auto_now_add=True)
    last_download = models.DateTimeField(null=True, blank=True)
    is_public = models.BooleanField(default=False)
    link_download = models.CharField(max_length=50, unique=True, blank=True)

    # Уникальность для пары (user, name)
    class Meta:
        unique_together = ['user', 'name']

    def save(self, *args, **kwargs):
        if not self.link_download:
            self.link_download = secrets.token_urlsafe(24)

        if not self.name and self.file:
            self.name = os.path.basename(self.file.name)

        # Уникальность имени файла уже гарантируется через поле name
        self.name = f"{self.user.username}_{secrets.token_urlsafe(8)}_{self.name}"
        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/api/storage/files/{self.pk}/download/"

    def delete(self, *args, **kwargs):
        # Удаляем файл с диска, если он существует
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
