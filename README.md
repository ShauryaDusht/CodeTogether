# Collaborative Python Code Editor

This project is a real-time collaborative Python code editor built with Django, Django Channels, WebSockets, Ace Editor/CodeMirror, and Docker. It includes features like live code editing, chat functionality, syntax completion, and user authentication.

---

## Features

- **Real-Time Collaboration**: Multiple users can edit Python code simultaneously in real-time.
- **Chat Feature**: Communicate with other users in the same room with a chat interface.
- **Syntax Completion**: Includes auto-closing brackets, quotes, and auto-indentation for Python.
- **Authentication**: Users can register, log in, and join rooms with unique codes.
- **Code Execution**: Execute Python code within the editor and view the output.
- **Cursor Tracking**: See the cursor positions of other users in real-time.
- **Room-Based Sessions**: Collaborative sessions are managed via room codes.

---

## Installation

### Prerequisites

- Python 3.9+
- Docker

### Clone the Repository

```bash
$ git clone https://github.com/ShauryaDusht/collaborative-code-editor.git
$ cd collaborative-code-editor
```

### Install Dependencies

1. **Create a Virtual Environment**:
   ```bash
   $ python3 -m venv venv
   $ source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Requirements**:
   ```bash
   $ pip install -r requirements.txt
   ```

### Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

### Run Migrations

```bash
$ python manage.py migrate
```

### Start the Server

```bash
$ python manage.py runserver
```

Access the app at `http://127.0.0.1:8000`.

---

## Usage

1. Register and log in.
2. Join or create a room using a unique room code.
3. Start collaborating in real-time with others.

---

## Running with Docker

### Build and Run the Docker Container

1. **Build the Docker Image**:
   ```bash
   $ docker build -t collaborative-code-editor .
   ```

2. **Run the Docker Container**:
   ```bash
   $ docker run -p 8000:8000 collaborative-code-editor
   ```

Access the app at `http://127.0.0.1:8000`.

---

## Folder Structure


---

## Technologies Used

- **Backend**: Django, Django Channels
- **Frontend**: Bootstrap
- **Database**: SQLite (default)
- **WebSockets**: Real-time communication
- **Containerization**: Docker

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.
