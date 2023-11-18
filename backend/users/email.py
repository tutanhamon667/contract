from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.contrib.sites.shortcuts import get_current_site
from django.core import mail
from django.template.context import make_context
from django.template.loader import get_template
from django.views.generic.base import ContextMixin
from djoser import utils
from djoser.conf import settings as djoser_settings

from .gmail import create_message, get_service, send_message

service = get_service()


class CustomEmailMessage(mail.EmailMultiAlternatives, ContextMixin):
    _node_map = {
        'subject': 'subject',
        'text_body': 'body',
        'html_body': 'html',
    }
    template_name = None

    def __init__(self, request=None, context=None, template_name=None,
                 *args, **kwargs):
        super(CustomEmailMessage, self).__init__(*args, **kwargs)

        self.request = request
        self.context = {} if context is None else context
        self.html = None

        if template_name is not None:
            self.template_name = template_name

    def get_context_data(self, **kwargs):
        ctx = super(CustomEmailMessage, self).get_context_data(**kwargs)
        context = dict(ctx, **self.context)
        if self.request:
            site = get_current_site(self.request)
            domain = context.get('domain') or (
                getattr(settings, 'DOMAIN', '') or site.domain
            )
            protocol = context.get('protocol') or (
                'https' if self.request.is_secure() else 'http'
            )
            site_name = context.get('site_name') or (
                getattr(settings, 'SITE_NAME', '') or site.name
            )
            user = context.get('user') or self.request.user
        else:
            domain = context.get('domain') or getattr(settings, 'DOMAIN', '')
            protocol = context.get('protocol') or 'http'
            site_name = context.get('site_name') or getattr(
                settings, 'SITE_NAME', ''
            )
            user = context.get('user')

        context.update({
            'domain': domain,
            'protocol': protocol,
            'site_name': site_name,
            'user': user
        })
        return context

    def render(self):
        context = make_context(self.get_context_data(), request=self.request)
        template = get_template(self.template_name)
        with context.bind_template(template.template):
            for node in template.template.nodelist:
                self._process_node(node, context)
        self._attach_body()

    def send(self, to, *args, **kwargs):
        self.render()
        self.to = to
        self.cc = kwargs.pop('cc', [])
        self.bcc = kwargs.pop('bcc', [])
        self.reply_to = kwargs.pop('reply_to', [])
        self.from_email = kwargs.pop(
            'from_email', settings.DEFAULT_FROM_EMAIL
        )
        for line in self.to:
            print(line)
# message = create_message("me", "maksimka@inbox.ru", self.subject, self.body)
        # send_message(service, 'me', message)

    def _process_node(self, node, context):
        attr = self._node_map.get(getattr(node, 'name', ''))
        if attr is not None:
            setattr(self, attr, node.render(context).strip())

    def _attach_body(self):
        if self.body and self.html:
            self.attach_alternative(self.html, 'text/html')
        elif self.html:
            self.body = self.html
            self.content_subtype = 'html'


class PasswordResetEmail(CustomEmailMessage):
    template_name = "email/password_reset.html"

    def get_context_data(self):
        # PasswordResetEmail can be deleted
        context = super().get_context_data()
        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)
        context["url"] = djoser_settings.PASSWORD_RESET_CONFIRM_URL.format(
            **context
        )
        return context
