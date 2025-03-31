from django.urls import path
from .views import get_files, CustomTokenObtainPairView, CustomRefreshTokenView, logout, is_authenticated, register

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', CustomRefreshTokenView.as_view(), name='token_refresh'),
    path('files/', get_files),
    path('logout/', logout),
    path('authenticated/', is_authenticated),
    path('register/', register),
]
