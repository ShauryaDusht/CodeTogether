import json
import subprocess
import tempfile
import os

from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

class CodeEditorConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f'code_{self.room_name}'

        # Join room group
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

        if message_type == 'code_update':
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

    async def broadcast_code_update(self, event):
        # Only send the update to other users
        if event['sender_channel'] != self.channel_name:
            await self.send(text_data=json.dumps({
                'type': 'code_update',
                'code': event['code']
            }))

    async def code_update(self, event):
        # Send code update to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'code_update',
            'code': event['code']
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
            'cpp': '.cpp'
        }
        return extensions.get(language, '.txt')

    def get_execution_command(self, language, file_path):
        commands = {
            'python': ['python3', file_path],
            'java': ['javac', file_path],
            'cpp': ['g++', file_path, '-o', file_path + '_executable', '&&', file_path + '_executable']
        }
        return commands.get(language, ['python3', file_path])