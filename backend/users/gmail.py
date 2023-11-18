import base64
import mimetypes
import os.path
import pickle
from email.mime.text import MIMEText

from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient import errors
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.send',
]


def get_service():
    creds = None
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(
                'C:/dev/file_5.json', SCOPES)
            creds = flow.run_local_server(port=0)
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)

    return build('gmail', 'v1', credentials=creds)


def send_message(service, sender, message):
    try:
        sent_message = (service.users().messages().send(
            userId=sender, body=message).execute()
        )
        return sent_message
    except errors.HttpError as error:
        print(F'An error occurred: {error}')


def create_message(sender, to, subject, message_text):
    message = MIMEText(message_text)
    message['to'] = to
    message['from'] = sender
    message['subject'] = subject
    s = message.as_string()
    b = base64.urlsafe_b64encode(s.encode('utf-8'))
    return {'raw': b.decode('utf-8')}
