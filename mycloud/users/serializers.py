from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError


class UserSerializer(serializers.ModelSerializer):
    storage_stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin', 'storage_stats']
        # read_only_fields = ['is_admin']

    def get_storage_stats(self, obj):
        # return obj.storage_stats
        return getattr(obj, "storage_stats", None)


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        min_length=8,
        error_messages={
            'min_length': 'Пароль должен содержать минимум 8 символов',
            'password_too_common': 'Пароль слишком распространён'
        }
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'username': {
                'error_messages': {
                    'unique': 'unique_username'  # Специальный код ошибки
                }
            },
            'email': {
                'error_messages': {
                    'unique': 'unique_email'  # Специальный код ошибки
                }
            }
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({
                "password": ["Пароли не совпадают"]
            })
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return User.objects.create_user(**validated_data)
