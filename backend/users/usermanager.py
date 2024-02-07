from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, login, display_name, password, **extra_fields):
        if not login:
            raise ValueError('Необходимо ввести login')
        if not display_name:
            raise ValueError('Необходимо ввести display_name')

        user = self.model(
            login=login,
            display_name=display_name,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, login, display_name, password, **extra_fields):
        user = self.create_user(
            login,
            display_name,
            password,
            **extra_fields
        )
        user.is_admin = True
#        user.is_superuser = True
        user.save(using=self._db)
        return user
