# from django.urls import path
# from rest_framework.routers import DefaultRouter
# from .views import FileViewSet, FileDownloadView  # импортируем новый view

# router = DefaultRouter()
# router.register(r'files', FileViewSet, basename='file')

# urlpatterns = router.urls + [
#     path('files/<str:link_download>/download/',
#          FileDownloadView.as_view(), name='file-download'),
# ]

# Claude
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet, FileDownloadView

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='file')

urlpatterns = [
    # Публичное скачивание по специальной ссылке (согласно заданию)
    # path('files/<str:link_download>/download/',
    #      FileDownloadView.as_view(), name='file-public-download'),
    path('public/<str:link_download>/',
         FileDownloadView.as_view(), name='file-public-download'),
] + router.urls

#     path('download/<str:link_download>/',  # Изменили путь
#          FileDownloadView.as_view(), name='file-public-download'),
# ] + router.urls


# from rest_framework.permissions import AllowAny
# from rest_framework.response import Response
# from rest_framework.views import APIView


# class TestView(APIView):
#     permission_classes = [AllowAny]
#     authentication_classes = []

#     def get(self, request):
#         return Response({"message": "Test endpoint works"})


# router = DefaultRouter()
# router.register(r'files', FileViewSet, basename='file')

# urlpatterns = [
#     path('test/', TestView.as_view(), name='test'),  # Тестовый endpoint
#     path('files/<str:link_download>/download/',
#          FileDownloadView.as_view(), name='file-public-download'),
# ] + router.urls
