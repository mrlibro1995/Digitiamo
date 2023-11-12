# Digitiamo Challenge Application
Welcome to the Digitiamo Challenge Application! This web application is designed to demonstrate the integration of Flask (Python) for the backend, React.js (JavaScript) for the frontend, and SQLite for database management. The application consists of two main pages: the Input Form page, where users can submit a URL request, and the Share page, where detailed information about the submitted URL request is presented along with a shareable link.
## Setup Instructions
1. **Create React Application:**
   ```bash
   npx create-react-app app
   cd app
2. **Create Server Directory and Virtual Environment:**
   ```bash
   mkdir api
   virtualenv -p python3 venv
3. **Activate Virtual Environment (Windows):**
   ```bash
   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
   .\venv\Scripts\activate
4. **Install Flask:**
   ```bash
   pip install flask
   pip install python-dotenv
5. **Create `api.py` File:**
    - Create a file named `api.py` in the `api` directory and add the server code.
6. **Create `.env` File:**
    - Create a file named `.env` in the root directory and add the following content:
    ```
    FLASK_APP=api.py
    FLASK_ENV=development
    ```

   This file is used to configure Flask settings.
