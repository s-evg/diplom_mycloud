from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet

router = DefaultRouter()
router.register(r'files', FileViewSet, basename='files')

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/v1/', include(router.urls)),
    path('api/v1/auth/', include('rest_framework.urls')),
]
