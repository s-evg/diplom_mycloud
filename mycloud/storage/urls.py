from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, FileDownloadView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    path('public/<str:link_download>/',
         FileDownloadView.as_view(), name='file-public-download'),
] + router.urls
