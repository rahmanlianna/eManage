# eManage

**From inbox to organized.**

eManage is a full-stack project management dashboard that helps turn project emails and updates into organized actions, risks, deadlines, and weekly project summaries.

## What It Does

Users can paste a project email or update into the dashboard.

The application then analyzes the text and organizes the information into:

- Project
- Actions
- Risks / Issues
- Deadlines

Each analysis can also be saved to a Weekly Project Tracker for up to 7 days.

## Features

- Paste project emails and updates
- Extract actions, risks, and deadlines
- Track multiple project updates
- Weekly project tracker
- Delete saved project updates
- Dynamic dashboard counts
- Responsive interface
- Browser storage using localStorage

## Tech Stack

### Frontend
- React
- JavaScript
- HTML
- CSS
- Vite

### Backend
- Python
- FastAPI
- Pydantic
- REST API

## How It Works

1. The user pastes a project email into the React frontend.
2. React sends the email to the FastAPI backend.
3. Python analyzes the email using rule-based keyword detection.
4. FastAPI returns structured project information as JSON.
5. React displays the results in the eAnalysis dashboard.
6. The project can be stored in the Weekly Project Tracker using localStorage.

## Current Version

The current version uses rule-based text analysis to identify project information.

Future improvements may include:

- AI-powered natural language processing
- Database storage
- User accounts
- Cloud deployment
- Improved project tracking
- Automatic owner detection
- Priority classification

## Project Structure

```text
eManage/
├── backend/
│   └── main.py
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md