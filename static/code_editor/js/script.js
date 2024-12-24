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
codeEditor.addEventListener('input', function () {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(sendCodeUpdate, doneTypingInterval);
});

// Code execution
runButton.addEventListener('click', function () {
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
chatInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

if (sendMessageButton) {
    sendMessageButton.addEventListener('click', sendChatMessage);
}

// Error handling for code editor
codeEditor.addEventListener('keydown', function (e) {
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

// Cursor position tracking
const userCursors = new Map();
const cursorContainer = document.createElement('div');
cursorContainer.id = 'cursor-container';
cursorContainer.style.position = 'absolute';
cursorContainer.style.inset = '0';
cursorContainer.style.pointerEvents = 'none';
document.getElementById('code-editor-container').appendChild(cursorContainer);

function getCaretCoordinates(textarea, position) {
    // Create a mirror div to measure text
    const mirror = document.createElement('div');
    const style = window.getComputedStyle(textarea);

    // Copy the essential styles from textarea to mirror
    const styleProperties = [
        'fontFamily',
        'fontSize',
        'fontWeight',
        'letterSpacing',
        'lineHeight',
        'padding',
        'border',
        'boxSizing',
        'whiteSpace',
        'wordWrap',
        'tabSize'
    ];

    styleProperties.forEach(prop => {
        mirror.style[prop] = style[prop];
    });

    // Set specific styles for measurement
    mirror.style.position = 'absolute';
    mirror.style.top = '0';
    mirror.style.left = '0';
    mirror.style.visibility = 'hidden';
    mirror.style.overflow = 'hidden';
    mirror.style.width = `${textarea.clientWidth}px`;

    // Get text up to cursor position
    const textBeforeCursor = textarea.value.substring(0, position);
    const textLine = textBeforeCursor.split('\n');
    const currentLineNumber = textLine.length - 1;
    const currentLineText = textLine[currentLineNumber];

    // Create content with the same whitespace and newlines
    mirror.textContent = textBeforeCursor;
    document.body.appendChild(mirror);

    // Calculate coordinates
    const mirrorRect = mirror.getBoundingClientRect();
    const textareaRect = textarea.getBoundingClientRect();

    // Calculate the exact position
    const caretHeight = parseInt(style.lineHeight);
    const top = currentLineNumber * caretHeight;

    // Create a span to measure the exact width of the current line
    const measureSpan = document.createElement('span');
    measureSpan.textContent = currentLineText;
    mirror.appendChild(measureSpan);
    const spanRect = measureSpan.getBoundingClientRect();
    const left = spanRect.width;

    // Clean up
    document.body.removeChild(mirror);

    // Account for textarea scroll position
    return {
        top: top + parseInt(style.paddingTop),
        left: left + parseInt(style.paddingLeft)
    };
}

function updateRemoteCursor(username, position) {
    let cursor = userCursors.get(username);
    if (!cursor) {
        cursor = document.createElement('div');
        cursor.className = 'remote-cursor';
        cursor.innerHTML = `
            <div class="cursor-line" style="background: ${stringToColor(username)}"></div>
            <div class="cursor-flag" style="background: ${stringToColor(username)}">
                ${username}
            </div>
        `;
        cursor.style.position = 'absolute';
        cursor.style.pointerEvents = 'none';
        cursorContainer.appendChild(cursor);
        userCursors.set(username, cursor);
    }

    // Apply position with smooth transition
    cursor.style.transition = 'transform 0.1s ease-out';
    cursor.style.transform = `translate(${position.coords.left}px, ${position.coords.top}px)`;
}

const style = document.createElement('style');
style.textContent = `
.remote-cursor {
    position: absolute;
    pointer-events: none;
    z-index: 1000;
    opacity: 0.8;
}

.cursor-flag {
    position: absolute;
    top: 0;
    left: 2px;
    padding: 1px 4px;
    border-radius: 2px;
    font-size: 10px;
    color: white;
    white-space: nowrap;
    opacity: 0.8;
    transform: translateY(-50%);
}

.cursor-line {
    position: absolute;
    width: 2px;
    height: 24px;
    background: inherit;
}

.remote-cursor:hover .cursor-flag {
    opacity: 1;
}
`;
document.head.appendChild(style);

function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${hash % 360}, 70%, 50%)`;
}

function sendCursorUpdate() {
    if (socket.readyState === WebSocket.OPEN) {
        const position = codeEditor.selectionStart;
        const coords = getCaretCoordinates(codeEditor, position);
        socket.send(JSON.stringify({
            'type': 'cursor_update',
            'position': {
                index: position,
                coords: coords
            }
        }));
    }
}

codeEditor.addEventListener('click', sendCursorUpdate);
codeEditor.addEventListener('keyup', sendCursorUpdate);
codeEditor.addEventListener('mousemove', sendCursorUpdate);


// WebSocket message handler
socket.onmessage = function (e) {
    const data = JSON.parse(e.data);
    console.log('Received WebSocket message:', data); // Debugging

    switch (data.type) {
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
        case 'cursor_update':
            updateRemoteCursor(data.username, data.position);
            break;
    }
};

socket.onclose = function (e) {
    console.error('WebSocket connection closed unexpectedly');
    outputDiv.textContent = 'Connection lost. Please refresh the page.';
    outputDiv.style.color = 'red';
};