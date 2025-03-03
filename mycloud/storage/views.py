from django.http import HttpResponse, HttpResponseNotFound
from django.shortcuts import render

# Create your views here.
menu = [
    {'title': 'Список пользователей', 'url_name': 'users'},
    {'title': 'Войти', 'url_name': 'login'},

]


def index(request):
    data = {
        'title': 'Главная страница',
        'menu': menu,
        # 'posts': data_db,
    }
    return render(request, 'storage/index.html', context=data)


# def users(request, user_id):
#     return HttpResponse(f'Страници приложения Storage<p>ID: {user_id}')

def users_slug(request, user_slug):
    return HttpResponse(f'Страници приложения Storage<p>Slug: {user_slug}')


def show_post(request, post_id):
    return HttpResponse(f"Отображение статьи с id = {post_id}")


def login(request):
    return HttpResponse("Авторизация")


def page_not_found(request, exception):
    HttpResponseNotFound('<h1>Страница не найдена</h1>')


def addpage(request):
    return HttpResponse("Добавление файлов")

# def page_not_found500(request, *args, **argv):
#     HttpResponseNotFound('<h1>Страница не найдена</h1>')
