from http import HTTPStatus

from django.test import TestCase
from django.test import Client

class AddBookFormTests(TestCase):
    def test_title_starting_lowercase(self):
        csrf_client = Client(enforce_csrf_checks=True)
        response = csrf_client.post("/api/profile_signup_worker", data={"login": "worker1", 'display_name': 'wqewq', 'password': 'Qwertyui!1', 'password1': 'Qwertyui!1'})
        print(response)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertContains(
            response, "Should start with an uppercase letter", html=True
        )
