from django.http import FileResponse
from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.conf import settings
import os

from .models import File
from .serializers import FileSerializer


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        user = self.request.user

        # Админы могут просматривать файлы любого пользователя
        if hasattr(user, 'is_admin') and user.is_admin and 'user_id' in self.request.query_params:
            try:
                user_id = int(self.request.query_params['user_id'])
                return File.objects.filter(user_id=user_id)
            except (ValueError, TypeError):
                return File.objects.none()

        # Обычные пользователи видят только свои файлы
        return File.objects.filter(user=user)

    def get_object(self):
        """Переопределяем получение объекта для админов"""
        # Админы могут получить любой файл по ID
        if hasattr(self.request.user, 'is_admin') and self.request.user.is_admin:
            queryset = File.objects.all()
        else:
            # Обычные пользователи - только свои файлы
            queryset = File.objects.filter(user=self.request.user)

        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        filter_kwargs = {self.lookup_field: self.kwargs[lookup_url_kwarg]}

        obj = get_object_or_404(queryset, **filter_kwargs)
        self.check_object_permissions(self.request, obj)
        return obj

    def perform_create(self, serializer):
        file_obj = self.request.FILES['file']
        serializer.save(
            user=self.request.user,
            name=file_obj.name,
            size=file_obj.size,
            file_type=file_obj.name.split('.')[-1].lower()
        )

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        # Проверяем права доступа: владелец или админ
        if not self._has_file_access(request.user, instance):
            return Response(
                {"detail": "У вас нет прав для изменения этого файла."},
                status=status.HTTP_403_FORBIDDEN
            )

        old_name = instance.name
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)

        new_name = serializer.validated_data.get('name')
        if new_name and new_name != old_name:
            # Переименовываем файл в файловой системе
            if not self._rename_physical_file(instance, new_name):
                return Response(
                    {"detail": "Файл с таким именем уже существует."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        self.perform_update(serializer)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        # Проверяем права доступа: владелец или админ
        if not self._has_file_access(request.user, instance):
            return Response(
                {"detail": "У вас нет прав для удаления этого файла."},
                status=status.HTTP_403_FORBIDDEN
            )

        return super().destroy(request, *args, **kwargs)

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file_obj = self.get_object()

        # Проверяем права доступа: владелец или админ
        if not self._has_file_access(request.user, file_obj):
            return Response(
                {"detail": "У вас нет прав для скачивания этого файла."},
                status=status.HTTP_403_FORBIDDEN
            )

        # Обновляем дату последнего скачивания
        file_obj.last_download = timezone.now()
        file_obj.save(update_fields=['last_download'])

        return FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.name
        )

    def _has_file_access(self, user, file_obj):
        """Проверка прав доступа к файлу: владелец или админ"""
        if not user.is_authenticated:
            return False

        # Владелец файла имеет доступ
        if user == file_obj.user:
            return True

        # Админ имеет доступ ко всем файлам
        return hasattr(user, 'is_admin') and user.is_admin

    def _rename_physical_file(self, instance, new_name):
        """Переименование физического файла на диске"""
        try:
            old_path = instance.file.path
            base_dir = os.path.dirname(old_path)
            ext = os.path.splitext(old_path)[1]  # сохраняем расширение
            new_path = os.path.join(base_dir, new_name + ext)

            if os.path.exists(new_path):
                return False  # Файл с таким именем уже существует

            os.rename(old_path, new_path)
            # Обновляем путь к файлу в модели
            instance.file.name = os.path.relpath(new_path, settings.MEDIA_ROOT)
            return True
        except (OSError, IOError):
            return False


class FileDownloadView(APIView):
    """
    Публичное скачивание файлов по специальной ссылке
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, link_download):
        try:
            file_obj = File.objects.get(link_download=link_download)
        except File.DoesNotExist:
            return Response(
                {'detail': 'Файл не найден.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not file_obj.is_public:
            return Response(
                {'detail': 'Этот файл недоступен по публичной ссылке.'},
                status=status.HTTP_403_FORBIDDEN
            )

        file_obj.last_download = timezone.now()
        file_obj.save(update_fields=['last_download'])

        return FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.name
        )


class FileDownloadView(APIView):
    """
    Публичное скачивание файлов по специальной ссылке
    """
    permission_classes = [AllowAny]
    authentication_classes = []

    def get(self, request, link_download):
        print(f"FileDownloadView called with: {link_download}")

        try:
            file_obj = File.objects.get(link_download=link_download)
        except File.DoesNotExist:
            return Response(
                {'detail': 'Файл не найден.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not file_obj.is_public:
            return Response(
                {'detail': 'Этот файл недоступен по публичной ссылке.'},
                status=status.HTTP_403_FORBIDDEN
            )

        file_obj.last_download = timezone.now()
        file_obj.save(update_fields=['last_download'])

        return FileResponse(
            file_obj.file.open('rb'),
            as_attachment=True,
            filename=file_obj.name
        )
