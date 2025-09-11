# from rest_framework import serializers
# from django.contrib.auth.password_validation import validate_password
# from .models import User
# import re


# class UserSerializer(serializers.ModelSerializer):
#     storage_stats = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'first_name', 'is_admin',
#                   'created_at', 'storage_stats']  # ИЗМЕНЕНО is_staff -> is_admin
#         read_only_fields = ['created_at']

#     def get_storage_stats(self, obj):
#         return getattr(obj, "storage_stats", None)


# class UserRegisterSerializer(serializers.ModelSerializer):
#     full_name = serializers.CharField(source='first_name', required=True)
#     password = serializers.CharField(
#         write_only=True,
#         required=True,
#         validators=[validate_password],
#         error_messages={
#             'min_length': 'Пароль должен содержать минимум 8 символов',
#             'password_too_common': 'Пароль слишком распространён'
#         }
#     )
#     password2 = serializers.CharField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = ['username', 'full_name', 'email', 'password', 'password2']
#         extra_kwargs = {
#             'username': {
#                 'error_messages': {
#                     'unique': 'unique_username'
#                 }
#             },
#             'email': {
#                 'error_messages': {
#                     'unique': 'unique_email'
#                 }
#             }
#         }

#     def validate_username(self, value):
#         if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
#             raise serializers.ValidationError(
#                 'Логин должен содержать только латинские буквы и цифры, начинаться с буквы и иметь длину от 4 до 20 символов.'
#             )
#         return value

#     def validate_email(self, value):
#         if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
#             raise serializers.ValidationError('Некорректный формат email.')
#         return value

#     def validate_password(self, value):
#         if len(value) < 6:
#             raise serializers.ValidationError(
#                 'Пароль должен содержать не менее 6 символов.')
#         if not re.search(r'[A-Z]', value):
#             raise serializers.ValidationError(
#                 'Пароль должен содержать хотя бы одну заглавную букву.')
#         if not re.search(r'\d', value):
#             raise serializers.ValidationError(
#                 'Пароль должен содержать хотя бы одну цифру.')
#         if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
#             raise serializers.ValidationError(
#                 'Пароль должен содержать хотя бы один специальный символ.')
#         return value

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError({
#                 "password": ["Пароли не совпадают"]
#             })
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop('password2')
#         user = User.objects.create_user(**validated_data)
#         # storage_path создастся автоматически в методе save() модели
#         return user


# ChatGPT
# from rest_framework import serializers
# from django.contrib.auth.password_validation import validate_password
# from rest_framework_simplejwt.tokens import RefreshToken
# from .models import User


# class UserSerializer(serializers.ModelSerializer):
#     storage_stats = serializers.SerializerMethodField()

#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'is_admin', 'storage_stats']
#         read_only_fields = ['is_admin']

#     def get_storage_stats(self, obj):
#         # Проверяем, чтобы не падало
#         return getattr(obj, "storage_stats", {})


# class UserRegisterSerializer(serializers.ModelSerializer):
#     password = serializers.CharField(
#         write_only=True,
#         required=True,
#         validators=[validate_password],
#         min_length=8,
#         error_messages={
#             'min_length': 'Пароль должен содержать минимум 8 символов',
#             'password_too_common': 'Пароль слишком распространён'
#         }
#     )
#     password2 = serializers.CharField(write_only=True, required=True)

#     class Meta:
#         model = User
#         fields = ['username', 'email', 'password', 'password2']

#     def validate(self, attrs):
#         if attrs['password'] != attrs['password2']:
#             raise serializers.ValidationError(
#                 {"password": "Пароли не совпадают"})
#         return attrs

#     def create(self, validated_data):
#         validated_data.pop('password2')
#         user = User.objects.create_user(**validated_data)

#         # Сразу создаём токены
#         refresh = RefreshToken.for_user(user)

#         return {
#             "user": UserSerializer(user).data,
#             "refresh": str(refresh),
#             "access": str(refresh.access_token),
#         }

# Claude
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
import re


class UserSerializer(serializers.ModelSerializer):
    storage_stats = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_admin', 'storage_stats']
        # read_only_fields = ['is_admin']
        read_only_fields = []

    def get_storage_stats(self, obj):
        # Проверяем, чтобы не падало
        return getattr(obj, "storage_stats", {})


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        min_length=6,  # Согласно заданию минимум 6 символов
        error_messages={
            'min_length': 'Пароль должен содержать минимум 6 символов',
            'password_too_common': 'Пароль слишком распространён'
        }
    )
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2']

    def validate_username(self, value):
        """Валидация логина согласно заданию"""
        if not re.match(r'^[a-zA-Z][a-zA-Z0-9]{3,19}$', value):
            raise serializers.ValidationError(
                'Логин должен содержать только латинские буквы и цифры, '
                'начинаться с буквы и иметь длину от 4 до 20 символов.'
            )
        return value

    def validate_email(self, value):
        """Валидация email согласно заданию"""
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', value):
            raise serializers.ValidationError('Некорректный формат email.')
        return value

    def validate_password(self, value):
        """Валидация пароля согласно заданию"""
        if len(value) < 6:
            raise serializers.ValidationError(
                'Пароль должен содержать не менее 6 символов.')
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                'Пароль должен содержать хотя бы одну заглавную букву.')
        if not re.search(r'\d', value):
            raise serializers.ValidationError(
                'Пароль должен содержать хотя бы одну цифру.')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError(
                'Пароль должен содержать хотя бы один специальный символ.')
        return value

    def validate(self, attrs):
        """Проверка совпадения паролей"""
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Пароли не совпадают"})
        return attrs

    def create(self, validated_data):
        """
        ИСПРАВЛЕНО: Возвращаем объект User, а не словарь
        Токены генерируются во view, а не в сериализаторе
        """
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        # storage_path создается автоматически в методе save() модели User
        return user
