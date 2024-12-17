from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from .models import CodeRoom
import random
import string

def generate_room_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def home(request):
    return render(request, 'code_editor/home.html')

def join_room(request):
    if request.method == 'POST':
        room_code = request.POST.get('room_code')
        try:
            room = CodeRoom.objects.get(name=room_code)
            return redirect('code_room', room_name=room.name)
        except CodeRoom.DoesNotExist:
            return render(request, 'code_editor/join_room.html', {'error': 'Room not found'})
    return render(request, 'code_editor/join_room.html')

def create_room(request):
    room_code = generate_room_code()
    room = CodeRoom.objects.create(name=room_code)
    return redirect('code_room', room_name=room_code)

def code_room(request, room_name):
    try:
        room = CodeRoom.objects.get(name=room_name)
    except CodeRoom.DoesNotExist:
        room = CodeRoom.objects.create(name=room_name)
    
    return render(request, 'code_editor/room.html', {
        'room_name': room_name,
        'languages': ['python', 'java', 'cpp']
    })