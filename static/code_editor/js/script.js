const roomName = document.getElementById('room-name').textContent.trim();
const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/code/${roomName}/`);

const codeEditor = document.getElementById('code-editor');
const runButton = document.getElementById('run-code');
const outputDiv = document.getElementById('output');
const languageSelect = document.getElementById('language');

// Add a status div to show WebSocket connection status
const statusDiv = document.createElement('div');
statusDiv.id = 'status';
statusDiv.style.marginBottom = '10px';
statusDiv.style.padding = '5px';
statusDiv.style.border = '1px solid #ccc';
statusDiv.style.borderRadius = '5px';
document.body.insertBefore(statusDiv, document.body.firstChild);

// Update connection status
function updateStatus(message, color) {
    statusDiv.textContent = message;
    statusDiv.style.color = color;
}

// WebSocket connection handlers
socket.onopen = function(e) {
    console.log('WebSocket connection established');
    updateStatus('WebSocket connection established', 'green');
};

socket.onerror = function(error) {
    console.error('WebSocket Error:', error);
    updateStatus('WebSocket connection error', 'red');
};

socket.onclose = function(event) {
    console.log('WebSocket connection closed:', event);
    updateStatus('WebSocket connection closed', 'orange');
};

// WebSocket message handler
socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    
    if (data.type === 'code_update') {
        // Prevent cursor jumping by only updating if different
        if (codeEditor.value !== data.code) {
            const cursorPosition = codeEditor.selectionStart;
            codeEditor.value = data.code;
            codeEditor.setSelectionRange(cursorPosition, cursorPosition);
        }
    } else if (data.type === 'execution_result') {
        outputDiv.textContent = data.output;
        outputDiv.style.color = 'black';
    } else if (data.type === 'execution_error') {
        outputDiv.textContent = 'Error: ' + data.error;
        outputDiv.style.color = 'red';
    }
};

// Debounced code update to reduce WebSocket traffic
let typingTimer; // Define the typingTimer variable
const doneTypingInterval = 100; // Interval time in milliseconds

function sendCodeUpdate() {
    socket.send(JSON.stringify({
        'type': 'code_update',
        'code': codeEditor.value
    }));
}

// Code update listener
codeEditor.addEventListener('input', function() {
    // Clear previous timer
    clearTimeout(typingTimer);
    
    // Set new timer
    typingTimer = setTimeout(sendCodeUpdate, doneTypingInterval);
});

// Code execution
runButton.addEventListener('click', function() {
    socket.send(JSON.stringify({
        'type': 'execute_code',
        'code': codeEditor.value,
        'language': languageSelect.value
    }));
});
