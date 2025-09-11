from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from storage.models import File

from .serializers import UserSerializer, UserRegisterSerializer

User = get_user_model()


class IsAdminUser(BasePermission):
    """Кастомная проверка на is_admin из модели User согласно заданию"""

    def has_permission(self, request, view):
        return (request.user.is_authenticated and
                getattr(request.user, 'is_admin', False))


class AdminUserListView(generics.ListCreateAPIView):
    """
    Список пользователей + создание (только для админов)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Используем кастомный класс
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get_queryset(self):
        users = super().get_queryset()
        # Добавляем статистику по файлам для каждого пользователя
        for user in users:
            files = File.objects.filter(user=user)
            total_size = sum(f.file.size for f in files if f.file)
            user.storage_stats = {
                "file_count": files.count(),
                "total_size_mb": round(total_size / (1024 * 1024), 2),
            }
        return users


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Детали / обновление / удаление пользователя (только для админов)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Используем кастомный класс
    permission_classes = [IsAuthenticated, IsAdminUser]

    def update(self, request, *args, **kwargs):
        # Только админы могут менять is_admin
        if 'is_admin' in request.data and not request.user.is_admin:
            return Response(
                {"detail": "Только администраторы могут изменять права доступа."},
                status=status.HTTP_403_FORBIDDEN
            )
        return super().update(request, *args, **kwargs)


class RegisterView(generics.CreateAPIView):
    """
    Регистрация новых пользователей + сразу возвращаем JWT токены
    """
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()  # Возвращает объект User

        # Генерация токенов после регистрации
        refresh = RefreshToken.for_user(user)

        return Response({
            "user": UserSerializer(user).data,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    """
    Получение данных текущего пользователя (требует авторизации)
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response(UserSerializer(user).data)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Кастомный эндпоинт для логина: возвращает токены + данные пользователя
    """

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == 200:
            user = User.objects.get(username=request.data["username"])
            response.data["user"] = UserSerializer(user).data

        return response
