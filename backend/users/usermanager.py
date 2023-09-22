from django.contrib.auth.models import BaseUserManager


class UserManager(BaseUserManager):
    def create_user(self, email, first_name, last_name,
                    password, **extra_fields):
        if not email:
            raise ValueError('Необходимо ввести email')
        if not first_name:
            raise ValueError('Необходимо ввести имя')
        if not last_name:
            raise ValueError('Необходимо ввести фамилию')

        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            **extra_fields
            )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, first_name, last_name,
                         password, **extra_fields):
        user = self.create_user(
            email,
            first_name,
            last_name,
            password,
            **extra_fields
        )
        user.is_admin = True
#        user.is_superuser = True
        user.save(using=self._db)
        return user
