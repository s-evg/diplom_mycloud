from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    # Регистрация
    path('register/', views.RegisterView.as_view(), name='register'),

    # Авторизация
    path('token/', views.CustomTokenObtainPairView.as_view(),
         name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Текущий пользователь
    path('user/', views.CurrentUserView.as_view(), name='current-user'),

    # Админские роуты
    path('admin/users/', views.AdminUserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:pk>/', views.AdminUserDetailView.as_view(),
         name='admin-user-detail'),
]
