from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from storage.views import page_not_found


urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('storage.urls')),
]

# Возмодность раздавать файлы в режиме отладки
if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL, document_root=settings.MEDIA_ROOT
    )


handler404 = page_not_found
# handler500 = page_not_found500
