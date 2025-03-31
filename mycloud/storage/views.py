from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render
from .models import File
# from ..users.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework import viewsets
from .serializers import FileSerializer
from users.serializers import UserRegistrationSerializer
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
# JWT Token получаем токен доступа, и обновляемый токен


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):

        try:
            response = super().post(request, *args, **kwargs)
            tokens = response.data
            access_token = tokens['access']
            refresh_token = tokens['refresh']
            res = Response()
            res.data = {'success': True}

            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            res.set_cookie(
                key="refresh_token",
                value=refresh_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res

        except:
            return Response({'success': False})

# Получаем токен обновления


class CustomRefreshTokenView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            # Получаем текущий токен обновления
            refresh_token = request.COOKIES.get('refresh_token')
            request.data['refresh'] = refresh_token
            # Отправляем текущий токен обновления для получения нового токена обновлений
            response = super().post(request, *args, **kwargs)
            # Наши токены
            tokens = response.data
            # токен доступа
            access_token = tokens['access']
            res = Response()
            res.data = {'refreshed': True}
            # устанвливаем в куки новый токен доступа с
            res.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )

            return res
        except:
            return Response({'refreshed': False})


@api_view(['POST'])
def logout(request):
    try:
        res = Response()
        res.data = {'success': True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('refresh_token', path='/', samesite='None')
        return res
    except:
        return Response({'success': False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def is_authenticated(request):
    return Response({'authenticated': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.error)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_files(request):
    user = request.user
    files = File.objects.filter(owner=user)
    serializer = FileSerializer(files, many=True)
    return Response(serializer.data)
