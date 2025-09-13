from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    help = 'Создаем пользователя admin с правами администратора'

    def handle(self, *args, **options):
        username = 'admin'

        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'Пользователь {username} уже существует')
            )
            return

        admin_user = User.objects.create_user(
            username=username,
            email='admin@admin.ru',
            password='Admin123!',
            first_name='Системный администратор',
            is_admin=True,
            is_staff=True,      # Для доступа к Django админке
            is_superuser=True   # Полные права в Django
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Администратор создан:\n'
                f'Username: {admin_user.username}\n'
                f'Email: {admin_user.email}\n'
                f'Password: Admin123!\n'
                f'Storage path: {admin_user.storage_path}'
            )
        )
