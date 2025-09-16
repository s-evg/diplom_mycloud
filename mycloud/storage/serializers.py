from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()
    private_download_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id', 'file', 'name', 'file_type', 'size', 'comment',
            'published', 'last_download', 'is_public',
            'link_download', 'download_url', 'private_download_url', 'user'
        ]
        read_only_fields = [
            'user', 'size', 'file_type', 'link_download',
            'published', 'last_download', 'download_url', 'private_download_url'
        ]

    # def get_download_url(self, obj):
    #     """Публичная ссылка для внешних пользователей"""
    #     # return obj.get_absolute_url()
    #     return f"http://176.108.254.47:8000/api/storage/public/{obj.link_download}/"

    # с динамической подстановкой хоста и порта
    def get_download_url(self, obj):
        """Публичная ссылка для внешних пользователей"""
        request = self.context.get('request')
        if request:
            # Используем метод build_absolute_uri для формирования полного URL
            relative_url = f"/api/storage/public/{obj.link_download}/"
            return request.build_absolute_uri(relative_url)
        else:
            # fallback, если request недоступен
            return f"/api/storage/public/{obj.link_download}/"

    def get_private_download_url(self, obj):
        """Приватная ссылка для владельца файла (через API с JWT)"""
        return f"/api/storage/files/{obj.pk}/download/"

    def validate_name(self, value):
        """Валидация имени файла"""
        if not value or not value.strip():
            raise serializers.ValidationError("Имя файла не может быть пустым")

        # Проверяем недопустимые символы для имени файла
        invalid_chars = ['/', '\\', ':', '*', '?', '"', '<', '>', '|']
        if any(char in value for char in invalid_chars):
            raise serializers.ValidationError(
                "Имя файла содержит недопустимые символы: / \\ : * ? \" < > |"
            )

        return value.strip()

    def validate(self, data):
        user = self.context['request'].user

        # Проверяем файл при загрузке
        file_obj = data.get('file')
        if file_obj:
            # Получаем имя файла (используем name из данных или имя загруженного файла)
            file_name = data.get('name') or file_obj.name

            # Проверяем уникальность имени файла у пользователя
            existing_query = File.objects.filter(user=user, name=file_name)

            # При обновлении исключаем текущий файл
            if self.instance:
                existing_query = existing_query.exclude(pk=self.instance.pk)

            if existing_query.exists():
                raise serializers.ValidationError({
                    "name": "Файл с таким именем уже существует"
                })

        # Проверяем изменение имени при обновлении
        if self.instance and 'name' in data:
            new_name = data['name']
            if new_name != self.instance.name:
                existing_query = File.objects.filter(user=user, name=new_name)
                existing_query = existing_query.exclude(pk=self.instance.pk)

                if existing_query.exists():
                    raise serializers.ValidationError({
                        "name": "Файл с таким именем уже существует"
                    })

        return data

    def create(self, validated_data):
        # Устанавливаем пользователя из контекста запроса
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

    def to_representation(self, instance):
        """Кастомизация вывода данных"""
        data = super().to_representation(instance)

        # Скрываем link_download для обычных пользователей (только админы видят)
        request = self.context.get('request')
        if request and request.user != instance.user:
            if not (hasattr(request.user, 'is_admin') and request.user.is_admin):
                data.pop('link_download', None)

        # Форматируем размер файла для удобства
        if data.get('size'):
            size_mb = data['size'] / (1024 * 1024)
            data['size_formatted'] = f"{size_mb:.2f} MB"

        return data
