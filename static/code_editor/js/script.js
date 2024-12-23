// WebSocket setup
const roomName = document.getElementById('room-name').textContent.trim();  // hidden element in room.html
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const socket = new WebSocket(`${wsProtocol}//${window.location.host}/ws/code/${roomName}/`);

// DOM Elements
const codeEditor = document.getElementById('code-editor');
const runButton = document.getElementById('run-code');
const outputDiv = document.getElementById('output');
const languageSelect = document.getElementById('language');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const sendMessageButton = document.getElementById('send-message');

// Time formatting function
function formatTimestamp(date) {
    return date.toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
    });
}

// Chat message function
function addChatMessage(username, message, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="username">${username}</span>
            <span class="timestamp">${timestamp}</span>
        </div>
        <div class="message-content">${message}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// WebSocket message handler
socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    
    switch(data.type) {
        case 'code_update':
            // Prevent cursor jumping by only updating if different
            if (codeEditor.value !== data.code) {
                const cursorPosition = codeEditor.selectionStart;
                codeEditor.value = data.code;
                codeEditor.setSelectionRange(cursorPosition, cursorPosition);
            }
            break;
            
        case 'execution_result':
            // Replace newline characters with <br> tags for HTML rendering
            outputDiv.innerHTML = data.output.replace(/\n/g, '<br>');
            outputDiv.style.color = 'white';
            break;
            
        case 'execution_error':
            outputDiv.textContent = 'Error: ' + data.error;
            outputDiv.style.color = 'red';
            break;
            
        case 'chat_message':
            addChatMessage(data.username, data.message, data.timestamp || formatTimestamp(new Date()));
            break;
    }
};

socket.onclose = function(e) {
    console.error('WebSocket connection closed unexpectedly');
    outputDiv.textContent = 'Connection lost. Please refresh the page.';
    outputDiv.style.color = 'red';
};

// Debounced code update to reduce WebSocket traffic
let typingTimer;
const doneTypingInterval = 100; // Interval time in milliseconds

function sendCodeUpdate() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            'type': 'code_update',
            'code': codeEditor.value
        }));
    }
}

// Code update listener
codeEditor.addEventListener('input', function() {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(sendCodeUpdate, doneTypingInterval);
});

// Code execution
runButton.addEventListener('click', function() {
    if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            'type': 'execute_code',
            'code': codeEditor.value,
            'language': languageSelect.value
        }));
    }
});

// Chat message sending
function sendChatMessage() {
    const message = chatInput.value.trim();
    if (message && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
            'type': 'chat_message',
            'message': message
        }));
        chatInput.value = '';
    }
}

// Chat input handlers
chatInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendChatMessage);
}

// Error handling for code editor
codeEditor.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = this.selectionStart;
        const end = this.selectionEnd;
        
        // Insert 4 spaces for tab
        this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
        
        // Put cursor at right position
        this.selectionStart = this.selectionEnd = start + 4;
    }
});