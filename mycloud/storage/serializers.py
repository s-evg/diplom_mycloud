# from rest_framework import serializers
# from .models import File


# class FileSerializer(serializers.ModelSerializer):
#     download_url = serializers.SerializerMethodField()

#     class Meta:
#         model = File
#         fields = ['id', 'file', 'name',  'file_type', 'size', 'comment',
#                   'published', 'last_download', 'is_public',
#                   'link_download', 'download_url', 'user']
#         # read_only_fields = ['user']
#         read_only_fields = ['user', 'size', 'file_type']

#     def get_download_url(self, obj):
#         return obj.get_absolute_url()

from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = [
            'id', 'file', 'name', 'file_type', 'size', 'comment',
            'published', 'last_download', 'is_public',
            'link_download', 'download_url', 'user'
        ]
        read_only_fields = ['user', 'size', 'file_type', 'name',
                            'link_download', 'published', 'last_download', 'download_url']

    def get_download_url(self, obj):
        return obj.get_absolute_url()

    def validate(self, data):
        user = self.context['request'].user
        file = data.get('file')
        if file:
            # Проверяем, не существует ли файл с таким же именем у пользователя
            existing_name = file.name
            if File.objects.filter(user=user, name=existing_name).exists():
                raise serializers.ValidationError({
                    "file": "Файл с таким именем уже существует"
                })
        return data

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
