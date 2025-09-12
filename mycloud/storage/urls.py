from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, FileDownloadView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    # Публичное скачивание по специальной ссылке d:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignored:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignored:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignored:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignored:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignored:\Learning\Netology\diplom\diplom_backend_is_ready\frontend\.gitignore
    # path('files/<str:link_download>/download/',
    #      FileDownloadView.as_view(), name='file-public-download'),
    path('public/<str:link_download>/',
         FileDownloadView.as_view(), name='file-public-download'),
] + router.urls
