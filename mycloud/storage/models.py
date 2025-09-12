from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from users.models import User
import os
import secrets


def user_directory_path(instance, filename):
    # Файл сохраняется как user_<username>/<original_filename>
    return f"user_{instance.user.username}/{filename}"


class File(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='files'
    )
    file = models.FileField(upload_to=user_directory_path)
    name = models.CharField(max_length=255, verbose_name='Имя файла')
    comment = models.TextField(blank=True, verbose_name='Комментарий')
    size = models.BigIntegerField(verbose_name='Размер в байтах')
    file_type = models.CharField(max_length=50, verbose_name='Тип файла')
    published = models.DateTimeField(
        default=timezone.now,  # ИСПРАВЛЕНО: вместо auto_now_add=True, убирает баг при миграциях
        verbose_name='Дата загрузки'
    )
    last_download = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name='Дата последнего скачивания'
    )
    is_public = models.BooleanField(
        default=True,
        verbose_name='Публичный доступ'
    )
    link_download = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
        verbose_name='Специальная ссылка'
    )

    class Meta:
        # Уникальное имя файла для каждого пользователя
        unique_together = ['user', 'name']
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-published']  # Новые файлы первыми

    def clean(self):
        # Проверка уникальности имени файла у одного пользователя
        existing = File.objects.filter(user=self.user, name=self.name)
        if self.pk:
            existing = existing.exclude(pk=self.pk)  # <- исключаем сам файл
        if existing.exists():
            raise ValidationError("Файл с таким именем уже существует.")

    def save(self, *args, **kwargs):
        if not self.link_download:
            self.link_download = secrets.token_urlsafe(24)

        # Устанавливаем имя файла, если не задано
        if not self.name and self.file:
            self.name = os.path.basename(self.file.name)

        self.full_clean()  # вызывает clean() и проверку ошибок

        super().save(*args, **kwargs)

    def get_absolute_url(self):
        return f"/api/storage/files/{self.link_download}/download/"

    def delete(self, *args, **kwargs):
        if self.file and os.path.isfile(self.file.path):
            os.remove(self.file.path)
        super().delete(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
