from rest_framework import serializers
from .models import File


class FileSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'file', 'name',  'file_type', 'size', 'comment',
                  'published', 'last_download', 'is_public',
                  'link_download', 'download_url', 'user']
        # read_only_fields = ['user']
        read_only_fields = ['user', 'size', 'file_type']

    def get_download_url(self, obj):
        return obj.get_absolute_url()
