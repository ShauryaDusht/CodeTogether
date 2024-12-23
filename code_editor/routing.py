from django.urls import re_path
from . import consumers

# routing for the websocket
websocket_urlpatterns = [
    re_path(r'ws/code/(?P<room_name>\w+)/$', consumers.CodeEditorConsumer.as_asgi()),
]