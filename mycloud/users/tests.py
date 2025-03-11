from http import HTTPStatus
from django.test import TestCase
from django.urls import reverse

# Create your tests here.
# Запсукается командой в терминале py manage.py test . все тесты
# py manage.py test users все тесты приложения users
# py manage.py test user.tests.UserProfileTestCase
# py manage.py test user.tests.UserProfileTestCase.test_case_1


class UserProfileTestCase(TestCase):
    # fixtures = ['user_user.json', 'files_files.json']

    def setUp(self):
        "Инициализация перед выполнением каждого теста."

    def test_case_1(self):
        path = reverse('home')
        response = self.client.get(path)
        self.assertEqual(response.status_code, HTTPStatus.OK)  # OK
        self.assertEqual(response.status_code, 302)  # Not OK
        self.assertEqual(response.context['title'], "Главная страница")  # OK

    def tearDown(self):
        # return super().tearDown()
        "Действия после выполнения каждого теста."
