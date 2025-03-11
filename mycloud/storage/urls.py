# from django.urls import path
# from .views import index, users_slug, addpage, login, show_post

# urlpatterns = [
#     path('', index, name='home'),
#     # path('users/<int:user_id>/', users),
#     # path('users/', users_slug, name='users'),
#     # path('addpage/', addpage, name='add_page'),
#     # path('login/', login, name='login'),
#     # path('user/<int:user_id>/', show_post, name='user'),
# ]

from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import FileViewSet

router = DefaultRouter()
router.register('files', FileViewSet, basename='files')

urlpatterns = [
    # path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
