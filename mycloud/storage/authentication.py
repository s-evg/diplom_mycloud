from rest_framework_simplejwt.authentication import JWTAuthentication


# Аутентификация пользователя по JWT-Токену
class CookiesJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        access_token = request.COOKIES.get('access_token')
        # Если токена нет, значит аутентификация не пройдена
        if not access_token:
            return None
        # Делаем токену валидацию
        validated_token = self.get_validated_token(access_token)
        # Пробуем получить пользователя с нашим токеном
        try:
            user = self.get_user(validated_token)
        except:
            return None

        # если все получилось, получаем пользователя и его токен
        return (user, validated_token)
