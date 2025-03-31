from rest_framework import serializers, views
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import User
from storage.models import File


class UserSerializer(serializers.ModelSerializer):
    files = serializers.SerializerMethodField(source=File.objects.all())

    class Meta:
        model = User
        # Для теста выводим максимальное количество полей для понимания, что все поля из AbstractUser подтягиваются
        fields = ['id', 'last_login', 'username', 'password',
                  'email', 'is_staff', 'is_authenticated', 'slug', 'files']
        print(fields)


@api_view(['POST'])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({"message": "Пользователь успешно создан"})
    return Response(serializer.errors, status=400)
