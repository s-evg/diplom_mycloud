from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True, verbose_name='Email')
    is_admin = models.BooleanField(
        default=False,
        verbose_name='Администратор',
        help_text='Определяет, является ли пользователь администратором системы'
    )
    # Добавляем поле для пути к хранилищу
    storage_path = models.CharField(
        max_length=255,
        blank=True,
        verbose_name='Путь к хранилищу',
        help_text='Относительный путь к папке пользователя в файловом хранилище'
    )
    created_at = models.DateTimeField(
        # Вместо auto_now_add=True(оно не может = NULL), убирает баг с миграциями
        default=timezone.now,
        verbose_name='Дата создания'
    )
    # storage_quota = models.BigIntegerField(default=1073741824)  # 1GB в байтах

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def save(self, *args, **kwargs):
        # Автоматически создаем путь к хранилищу при создании пользователя
        if not self.storage_path and self.username:
            self.storage_path = f"user_{self.username}"
        super().save(*args, **kwargs)

    def __str__(self):
        # return self.username
        return f"{self.username} ({self.email})"
