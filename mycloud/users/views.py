from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .models import User
from .serializers import UserSerializer, UserRegisterSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


class AdminUserListView(generics.ListCreateAPIView):
    """
    API endpoint для просмотра и создания пользователей (только для администраторов)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class AdminUserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint для детального просмотра, обновления и удаления пользователей (только для администраторов)
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdminUser]


class RegisterView(generics.CreateAPIView):
    """
    API endpoint для регистрации новых пользователей
    """
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            errors = serializer.errors

            # Определяем точную причину ошибки
            if 'username' in errors and errors['username'][0].code == 'unique':
                return Response(
                    {"error": "Данное имя пользователя уже занято"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif 'email' in errors and errors['email'][0].code == 'unique':
                return Response(
                    {"error": "Данный email уже используется"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Для остальных ошибок валидации
            error_messages = []
            for field, error_list in errors.items():
                error_messages.extend([str(error) for error in error_list])

            return Response(
                {"error": " | ".join(error_messages)},
                status=status.HTTP_400_BAD_REQUEST
            )

        self.perform_create(serializer)
        return Response(
            {"success": "Регистрация прошла успешно!"},
            status=status.HTTP_201_CREATED
        )


class CurrentUserView(APIView):
    """
    API endpoint для получения данных текущего пользователя
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'is_admin': user.is_admin
        })


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            return Response({
                'access': response.data['access'],
                'refresh': response.data['refresh'],
                'user': {
                    'id': self.user.id,
                    'username': self.user.username,
                    'is_admin': self.user.is_admin
                }
            }, status=status.HTTP_200_OK)
        return response
