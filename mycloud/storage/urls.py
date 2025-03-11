from django.urls import path
from .views import index, users_slug, addpage, login, show_post

urlpatterns = [
    path('', index, name='home'),
    # path('users/<int:user_id>/', users),
    # path('users/', users_slug, name='users'),
    # path('addpage/', addpage, name='add_page'),
    # path('login/', login, name='login'),
    # path('user/<int:user_id>/', show_post, name='user'),
]
