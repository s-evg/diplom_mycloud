from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    # Скрываем поле выбора/ввода пользователя от чьего имени мы добавляем файлы
    user = serializers.HiddenField(default=serializers.CurrentUserDefault())

    class Meta:
        model = File
        fields = ['id', 'file', 'comment', 'size', 'link_download',
                  'published', 'lastload', 'slug', 'user', 'owner']
