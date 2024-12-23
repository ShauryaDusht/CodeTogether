from django.shortcuts import render, redirect, get_object_or_404
from django.views import View
from django.views.generic import TemplateView, FormView, RedirectView
from django.contrib.auth.views import LoginView, LogoutView
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.mixins import LoginRequiredMixin
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse_lazy
from .models import CodeRoom
import random
import string
from django.contrib.auth import login
from django.utils.decorators import method_decorator

class HomeView(TemplateView):
    template_name = 'code_editor/home.html'

'''
 $$$$$$\  $$\   $$\ $$$$$$$$\ $$\   $$\ 
$$  __$$\ $$ |  $$ |\__$$  __|$$ |  $$ |
$$ /  $$ |$$ |  $$ |   $$ |   $$ |  $$ |
$$$$$$$$ |$$ |  $$ |   $$ |   $$$$$$$$ |
$$  __$$ |$$ |  $$ |   $$ |   $$  __$$ |
$$ |  $$ |$$ |  $$ |   $$ |   $$ |  $$ |
$$ |  $$ |\$$$$$$  |   $$ |   $$ |  $$ |
\__|  \__| \______/    \__|   \__|  \__|
'''
class RegisterView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = UserCreationForm()
        for field in form.fields.values():
            field.widget.attrs['class'] = 'form-control'
        return render(request, 'authentication/register.html', {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('home')
        form = UserCreationForm(request.POST)
        for field in form.fields.values():
            field.widget.attrs['class'] = 'form-control'
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('home')
        return render(request, 'authentication/register.html', {'form': form})

class CustomLoginView(LoginView):
    template_name = 'authentication/login.html'
    success_url = reverse_lazy('home')
    redirect_authenticated_user = True

    def get_success_url(self):
        return self.success_url

    def form_valid(self, form):
        messages.success(self.request, 'Login successful!')
        return super().form_valid(form)

    def form_invalid(self, form):
        messages.error(self.request, 'Invalid username or password.')
        return super().form_invalid(form)

class CustomLogoutView(LogoutView):
    next_page = reverse_lazy('home')
    
    def dispatch(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            messages.info(request, 'You have been logged out.')
        return super().dispatch(request, *args, **kwargs)

'''
$$$$$$$\   $$$$$$\   $$$$$$\  $$\      $$\ 
$$  __$$\ $$  __$$\ $$  __$$\ $$$\    $$$ |
$$ |  $$ |$$ /  $$ |$$ /  $$ |$$$$\  $$$$ |
$$$$$$$  |$$ |  $$ |$$ |  $$ |$$\$$\$$ $$ |
$$  __$$< $$ |  $$ |$$ |  $$ |$$ \$$$  $$ |
$$ |  $$ |$$ |  $$ |$$ |  $$ |$$ |\$  /$$ |
$$ |  $$ | $$$$$$  | $$$$$$  |$$ | \_/ $$ |
\__|  \__| \______/  \______/ \__|     \__|
'''
@method_decorator(login_required(login_url=reverse_lazy('login')), name='dispatch')
class CreateRoomView(RedirectView):
    def get_redirect_url(self, *args, **kwargs):
        room_code = self.generate_room_code()
        room = CodeRoom.objects.create(name=room_code, creator=self.request.user)
        return reverse_lazy('code_room', kwargs={'room_name': room_code})

    @staticmethod
    def generate_room_code(length=6):
        return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

@method_decorator(login_required(login_url=reverse_lazy('login')), name='dispatch')
class JoinRoomView(View):
    def get(self, request):
        return render(request, 'code_editor/join_room.html')

    def post(self, request):
        room_code = request.POST.get('room_code')
        try:
            room = CodeRoom.objects.get(name=room_code)
            return redirect('code_room', room_name=room.name)
        except CodeRoom.DoesNotExist:
            return render(request, 'code_editor/join_room.html', {'error': 'Room not found'})

@method_decorator(login_required(login_url=reverse_lazy('login')), name='dispatch')
class CodeRoomView(TemplateView):
    template_name = 'code_editor/room.html'
    
    def get_context_data(self, **kwargs):
        room_name = kwargs['room_name']
        room = get_object_or_404(CodeRoom, name=room_name)
        context = super().get_context_data(**kwargs)
        context['room_name'] = room_name
        context['languages'] = ['python', 'java', 'cpp']
        return context