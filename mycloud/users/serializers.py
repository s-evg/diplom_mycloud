from rest_framework import serializers, views
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import User
from storage.models import File


class UserSerializer(serializers.ModelSerializer):
    # files = serializers.SerializerMethodField(source=File.objects.all())

    class Meta:
        model = User
        # Для теста выводим максимальное количество полей для понимания, что все поля из AbstractUser подтягиваются
        fields = ['id', 'last_login', 'username', 'password',
                  'email', 'is_staff', 'is_authenticated', 'slug', 'files']
        # print(fields)
        # fields = ['username', 'first_name',
        #           'last_name', 'email', 'date_joined']


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User(
            username=validated_data['username'],
            email=validated_data['email']
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
