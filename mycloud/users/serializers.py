from rest_framework import serializers
from .models import User
from storage.models import File


class UserSerializer(serializers.ModelSerializer):
    files = serializers.SerializerMethodField(source=File.objects.all())

    class Meta:
        model = User
        fields = ['id', 'last_login', 'username', 'password',
                  'email', 'is_staff', 'is_authenticated', 'slug', 'files']
