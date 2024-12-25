# 🚀 Collaborative Python Code Editor

[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-Latest-green.svg)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

> Transform your coding experience with real-time collaboration! Write, share, and execute Python/C++/Java code together in a powerful, intuitive environment.

## Preview
You can view or download the file from the link: [Video](https://drive.google.com/file/d/1DPq_k81zXmnlQnFxjSWoJolZMgR_gIBO/view)

## ✨ Key Features

### 🤝 Real-Time Collaboration
- **Live Code Editing** - Watch changes appear instantly as your team codes
- **Cursor Tracking** - See where others are working in real-time
- **Room-Based Sessions** - Create private coding spaces with unique room codes

### 💻 Powerful Editor
- **Intelligent Syntax Completion** 
  - Auto-closing brackets and quotes
  - Smart indentation
- **Code Execution** - Run your Python code directly in the browser

### 🔒 Security & Authentication
- **Secure User Accounts** - Protected access to your coding spaces
- **Private Rooms** - Control who can join your sessions
- **Safe Code Execution** - Sandboxed environment for running code

### 💬 Team Features
- **Built-in Chat** - Discuss code changes in real-time
## 🚀 Quick Start

### 📋 Prerequisites
```bash
- Python 3.9+
- Docker
- Docker Compose
```

### 🧑‍💻 Clone the Repository

```bash
$ git clone https://github.com/ShauryaDusht/CodeTogether.git
$ cd CodeTogether
```

### 🔧 Install Dependencies

1. **Create a Virtual Environment**:
   ```bash
   $ python3 -m venv venv
   ```
   For Linux:
   ```
   $ source venv/bin/activate  
   ```
   For Windows:
   ```bash
   .\venv\Scripts\activate
   ```

2. **Install Requirements**:
   ```bash
   $ pip install -r requirements.txt
   ```

### 🌐 Set Up Environment Variables

Create a `.env` file in the root directory with the following content:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

### 🛠️ Run Migrations

```bash
$ python manage.py migrate
```

### 🚀 Start the Server

```bash
$ python manage.py runserver
```

Open your browser and access the app at `http://127.0.0.1:8000`.

---

## 🐳 Running with Docker Compose

### 🌐Set Up Environment Variables

Ensure the `.env` file is present with the following content:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
```

### 🐳 Use Docker Compose

1. **Build and Run the Application**:
   ```bash
   $ docker-compose up --build
   ```

2. **Stop the Application**:
   ```bash
   $ docker-compose down
   ```

Open your browser and access the app at `http://127.0.0.1:8000`.

---

## 🛠️ Technologies Used

### ⚡ Backend:
- Django & Django Channels for robust server-side operations
- WebSocket implementation for real-time features

### 🎯 Frontend:
- Modern Bootstrap UI for responsive design
- Advanced code editor integration

### 📊 Database:
- SQLite (default) for easy setup
- Scalable to PostgreSQL for production

### 🖥️ Development:
- Docker Compose for container orchestration
- Environment-based configuration

---

## 📁 Folder Structure

```
collaborative_code_editor/            # Root project directory
│
├── collaborative_code_editor/        # Project configuration
│   ├── __init__.py
│   ├── asgi.py                       # ASGI configuration (needed for WebSockets)
│   ├── settings.py                   # Project settings
│   ├── urls.py                       # Main URL configuration
│   └── wsgi.py                       # WSGI configuration
│
├── code_editor/                      # Main app
│   ├── migrations/
│   │   └── __init__.py
│   │
│   ├── templates/                    # HTML templates
│   │   ├── code_editor/
│   │   │   ├── home.html
│   │   │   ├── join_room.html
│   │   │   └── room.html
│   │   └── authentication/
│   │       ├── login.html
│   │       └── register.html
│   │
│   │
│   ├── __init__.py
│   ├── admin.py                     # Admin interface configuration
│   ├── apps.py                      # App configuration
│   ├── consumers.py                 # WebSocket consumers
│   ├── models.py                    # Database models
│   ├── routing.py                   # WebSocket URL routing
│   ├── urls.py                      # HTTP URL routing
│   └── views.py                     # HTTP views
│
├── static/                           # Static files
│   └── code_editor/
│       ├── css/
│       │   ├── auth.css              # Authentication styles
│       │   ├── join_room.css         # Join room page styles
│       │   └── style.css             # Global styles
│       └── js/
│           └── script.js             # Frontend JavaScript
│
├── .gitignore                       # Git ignore file
├── docker-compose.yml               # Docker Compose configuration
├── Dockerfile                       # Docker configuration
├── LICENSE                          # Project license
├── manage.py                        # Django management script
├── README.md                        # Project documentation
├── .env                             # Environment variables file (to be created)
└── requirements.txt                 # Project dependencies
```
---

## 🔧 Technologies Used

- **Backend**: Django, Django Channels
- **Frontend**: Bootstrap
- **Database**: SQLite (default)
- **WebSockets**: Real-time communication
- **Containerization**: Docker

---

### 🤝 Contributing

I welcome contributions! If you'd like to contribute, feel free to fork the repository, make changes, and create a pull request. Please ensure your changes are well-documented.

For any issues or suggestions, open an issue in the repository.

---

### 📧 Contact

Feel free to reach out to me via email for any queries or collaboration opportunities:

📧 [shauryadusht@gmail.com](mailto:shauryadusht@gmail.com)
