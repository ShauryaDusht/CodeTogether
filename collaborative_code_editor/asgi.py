import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
import code_editor.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'collaborative_code_editor.settings')

# protocol type router for routing HTTP and WebSocket requests
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            code_editor.routing.websocket_urlpatterns
        )
    ),
})