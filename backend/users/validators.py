import re

from django.core.exceptions import ValidationError


class UppercaseValidator(object):
    '''The password must contain at least 1 uppercase letter, A-Z.'''
    def validate(self, password, user=None):
        if not re.findall('[A-Z]', password):
            raise ValidationError(
                ('Пароль должен содержать хотя бы 1 заглавную букву, '
                  + 'A-Z.'),
                code='password_no_upper',
            )

    def get_help_text(self):
        return (
            "Пароль должен содержать хотя бы 1 заглавную букву, A-Z."
        )


class SpecialCharValidator(object):
    ''' The password must contain at least 1 special character @#$%!^&* '''
    def validate(self, password, user=None):
        if not re.findall('[@#$%!^&*]', password):
            raise ValidationError(
                ('Пароль должен содержать хотя бы 1 специальный символ: '
                  + '@#$%!^&*'),
                code='password_no_symbol',
            )

    def get_help_text(self):
        return (
            'Пароль должен содержать хотя бы 1 специальный символ: '
            + '@#$%!^&*'
        )


class DigitValidator(object):
    '''The password must contain at least 1 digit, 0-9.'''
    def validate(self, password, user=None):
        if not re.findall('[0-9]', password):
            raise ValidationError(
                ('Пароль должен содержать хотя бы 1 цифру, '
                  + '0-9.'),
                code='password_no_digit',
            )

    def get_help_text(self):
        return (
            "Пароль должен содержать хотя бы 1 цифру, 0-9."
        )
