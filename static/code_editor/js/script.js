const roomName = document.getElementById('room-name').textContent.trim();
const socket = new WebSocket(`${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/code/${roomName}/`);

const codeEditor = document.getElementById('code-editor');
const runButton = document.getElementById('run-code');
const outputDiv = document.getElementById('output');
const languageSelect = document.getElementById('language');

// WebSocket message handler

// Print output in multiple lines
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
        // Replace newline characters with <br> tags for HTML rendering
        outputDiv.innerHTML = data.output.replace(/\n/g, '<br>');
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