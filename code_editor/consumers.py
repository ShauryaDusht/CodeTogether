import json
import subprocess
import tempfile
import os
from datetime import datetime
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class CodeEditorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'code_{self.room_name}'
        self.user = self.scope["user"]

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type')
        if message_type == 'cursor_update':
            username = self.user.username if self.user.is_authenticated else 'Anonymous'
            await self.channel_layer.group_send(
                self.room_group_name,{
                    'type': 'broadcast_cursor_position',
                    'username': username,
                    'position': data['position'],
                    'sender_channel': self.channel_name
                }
            )

        elif message_type == 'code_update':
            # Broadcast code update to all users in the room
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'broadcast_code_update',
                    'code': data['code'],
                    'sender_channel': self.channel_name  # Add sender channel to prevent echoing
                }
            )
        elif message_type == 'execute_code':
            # Execute the code and send back results
            code = data['code']
            language = data.get('language', 'python')
            
            try:
                output = await self.execute_code(code, language)
                await self.send(text_data=json.dumps({
                    'type': 'execution_result',
                    'output': output
                }))
            except Exception as e:
                await self.send(text_data=json.dumps({
                    'type': 'execution_error',
                    'error': str(e)
                }))
        elif message_type == 'chat_message':
            # Handle chat messages
            username = self.user.username if self.user.is_authenticated else 'Anonymous'
            timestamp = datetime.now().strftime('%I:%M %p')  # 12-hour format
            
            # Broadcast chat message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'message': data['message'],
                    'username': username,
                    'timestamp': timestamp
                }
            )

    async def broadcast_code_update(self, event):
        # Only send the update to other users
        if event['sender_channel'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'code_update',
                'code': event['code']
            }))

    async def chat_message(self, event):
        # Send chat message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message'],
            'username': event['username'],
            'timestamp': event['timestamp']
        }))

    async def code_update(self, event):
        # Send code update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'code_update',
            'code': event['code']
        }))
    async def broadcast_cursor_position(self, event):
        if event['sender_channel'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'cursor_update',
                'username': event['username'],
                'position': event['position']
            }))

    @database_sync_to_async
    def execute_code(self, code, language):
        with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix=self.get_file_extension(language)) as temp:
            temp.write(code)
            temp.close()

        try:
            command = self.get_execution_command(language, temp.name)
            result = subprocess.run(command, capture_output=True, text=True, timeout=10)
            
            # Combine stdout and stderr
            output = result.stdout + result.stderr
            return output
        except subprocess.TimeoutExpired:
            return "Execution timed out"
        except Exception as e:
            return f"Execution error: {str(e)}"
        finally:
            os.unlink(temp.name)

    def get_file_extension(self, language):
        extensions = {
            'python': '.py',
            'java': '.java',
            'cpp': '.cpp',
            'javascript': '.js'
        }
        return extensions.get(language, '.txt')

    def get_execution_command(self, language, file_path):
        commands = {
            'python': ['python3', file_path],
            'java': ['javac', file_path],
            'cpp': ['g++', file_path, '-o', file_path + '_executable', '&&', file_path + '_executable'],
            'javascript': ['node', file_path]
        }
        return commands.get(language, ['python3', file_path])

    async def user_join(self, event):
        # Notify when a user joins the room
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'message': f"{event['username']} joined the room",
            'timestamp': datetime.now().strftime('%I:%M %p')
        }))

    async def user_leave(self, event):
        # Notify when a user leaves the room
        await self.send(text_data=json.dumps({
            'type': 'system_message',
            'message': f"{event['username']} left the room",
            'timestamp': datetime.now().strftime('%I:%M %p')
        }))