from rest_framework import generics, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.http import FileResponse
from .models import File
from .serializers import FileSerializer
from django.utils import timezone
from rest_framework.parsers import MultiPartParser, FormParser


class FileViewSet(viewsets.ModelViewSet):
    serializer_class = FileSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff and 'user_id' in self.request.query_params:
            return File.objects.filter(user_id=self.request.query_params['user_id'])
        return File.objects.filter(user=user)

    def perform_create(self, serializer):
        file_obj = self.request.FILES['file']
        serializer.save(
            user=self.request.user,
            name=file_obj.name,
            size=file_obj.size,
            file_type=file_obj.name.split('.')[-1].lower()
        )

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        file_obj = self.get_object()
        file_obj.last_download = timezone.now()
        file_obj.save()
        return FileResponse(file_obj.file)
