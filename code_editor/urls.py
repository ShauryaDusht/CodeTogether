from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('join/', views.join_room, name='join_room'),
    path('create/', views.create_room, name='create_room'),
    path('room/<str:room_name>/', views.code_room, name='code_room'),
]