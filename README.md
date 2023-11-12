# Digitiamo Challenge Application
Welcome to the Digitiamo Challenge Application! This web application is designed to demonstrate the integration of Flask (Python) for the backend, React.js (JavaScript) for the frontend, and SQLite for database management. The application consists of two main pages: the Input Form page, where users can submit a URL request, and the Share page, where detailed information about the submitted URL request is presented along with a shareable link.

## Application Overview

The web application is designed to analyze and display detailed information about user-submitted URL requests. It consists of two main pages: the Input Form Page and the Share Page.

### Input Form Page
On this page, users can submit a URL request. Once a request is submitted, the application analyzes the provided URL on the server. Relevant responses are generated, and both the request and response details are stored securely in the database.

### Share Page
After submitting a URL request, users are redirected to the Share Page. This page displays comprehensive information about the submitted request, including server details, location, and date. This information is retrieved from the database and presented in an organized dashboard format.

In addition to request and response details, the application interacts with the Google Cloud Platform to obtain performance information about the URL. To ensure a seamless user experience, this process runs in parallel with fetching information from the backend. This ensures that the page continues to load without interruptions.

To enhance security, the request_id is hashed before being transferred between pages. This precaution is implemented to prevent vulnerabilities.

## Videos

Watch the following videos for a better understanding of the application:

- **[digitiamo_app (Shorter Video)](link_to_shorter_video):**
  - Overview of the application's appearance and functionality.

- **[digitiamo_code (Longer Video)](link_to_longer_video):**
  - In-depth information about the coding and implementation.

Feel free to explore the code, read the comments for additional insights, and don't hesitate to reach out if you have any questions or feedback.



## Setup Instructions

Follow these steps to set up and run the application:

```bash
# Create React Application
npx create-react-app app
cd app

# Create Server Directory (Flask) and Virtual Environment
mkdir api
virtualenv -p python3 venv

# Activate Virtual Environment (Windows)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\venv\Scripts\activate

# Install Flask and Python-Dotenv
pip install flask
pip install python-dotenv

# Create `api.py` File
# Write the server code in the `api.py` file.

# Create `.env` File
# Fill it with:
# FLASK_APP=api.py
# FLASK_ENV=development

# Run Flask Project
flask run

# Connect React to Flask
# Add the following to `package.json`:
# "start-flask-api": "cd api && flask run",
# "proxy": "http://127.0.0.1:5000/"

# Start Flask application (back)
npm run start-flask-api

# Start React application (front) in another tab
npm start
