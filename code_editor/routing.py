from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/code/(?P<room_name>\w+)/$', consumers.CodeEditorConsumer.as_asgi()),
]