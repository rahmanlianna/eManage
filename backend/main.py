from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import re


app = FastAPI()


# --------------------
# CORS
# Allows React to talk to FastAPI
# --------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5176",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------
# TEMPORARY DATA
# --------------------

projects = [
    {
        "name": "Mobile App Redesign",
        "owner": "Maya",
        "progress": 78,
        "status": "At Risk"
    }
]


tasks = [
    {
        "title": "Review prototype",
        "owner": "Maya",
        "due_date": "Friday",
        "priority": "High"
    }
]


# --------------------
# DATA MODELS
# --------------------

class Project(BaseModel):
    name: str
    owner: str
    progress: int
    status: str


class Task(BaseModel):
    title: str
    owner: str
    due_date: str
    priority: str


class EmailInput(BaseModel):
    text: str


# --------------------
# HOME
# --------------------

@app.get("/")
def home():
    return {
        "message": "eManage backend is running"
    }


# --------------------
# PROJECTS
# --------------------

@app.get("/projects")
def get_projects():
    return projects


@app.post("/projects")
def add_project(project: Project):

    new_project = project.model_dump()

    projects.append(new_project)

    return new_project


# --------------------
# TASKS
# --------------------

@app.get("/tasks")
def get_tasks():
    return tasks


@app.post("/tasks")
def add_task(task: Task):

    new_task = task.model_dump()

    tasks.append(new_task)

    return new_task


# --------------------
# EMAIL ANALYSIS
# --------------------

@app.post("/analyze")
def analyze_email(email: EmailInput):

    text = email.text


    # Break the email into separate lines
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip()
    ]


    # --------------------
    # ACTION WORDS
    # --------------------

    action_words = [
        "please",
        "need to",
        "needs to",
        "should",
        "must",
        "complete",
        "finish",
        "review",
        "update",
        "prepare",
        "create",
        "send",
        "submit",
        "check",
        "confirm",
        "schedule",
        "fix",
        "resolve",
        "follow up",
        "contact",
        "test",
        "build",
        "design",
        "approve",
        "finalize",
        "assign",
        "upload",
        "deliver",
        "implement",
        "research",
        "draft",
        "revise",
        "organize",
        "coordinate",
        "respond",
        "reach out",
        "make sure",
        "action item",
        "todo",
        "to-do"
    ]


    # --------------------
    # RISK WORDS
    # --------------------

    risk_words = [
        "risk",
        "issue",
        "problem",
        "delay",
        "delayed",
        "blocked",
        "blocker",
        "security",
        "concern",
        "failure",
        "failing",
        "error",
        "bug",
        "missing",
        "late",
        "behind",
        "pending",
        "unresolved",
        "dependency",
        "waiting",
        "unavailable",
        "conflict",
        "overdue",
        "stuck",
        "not working",
        "cannot",
        "can't",
        "may impact",
        "could impact",
        "at risk",
        "warning",
        "bottleneck",
        "approval pending"
    ]


    # --------------------
    # DEADLINE WORDS
    # --------------------

    deadline_words = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
        "today",
        "tomorrow",
        "next week",
        "next month",
        "end of week",
        "end of month"
    ]


    # --------------------
    # PROJECT WORDS
    # --------------------

    project_words = [
        "project",
        "redesign",
        "launch",
        "website",
        "dashboard",
        "app",
        "platform",
        "migration",
        "integration",
        "campaign",
        "portal",
        "system",
        "initiative",
        "implementation"
    ]


    actions = []
    risks = []
    deadlines = []


    # --------------------
    # ANALYZE EACH LINE
    # --------------------

    for line in lines:

        lower_line = line.lower()


        # Put a sentence into one main category
        if any(word in lower_line for word in risk_words):

            risks.append(line)


        elif any(word in lower_line for word in action_words):

            actions.append(line)


        # Check deadlines separately
        # We only save the actual day/date
        for word in deadline_words:

            if word in lower_line:

                deadline = word.title()

                if deadline not in deadlines:
                    deadlines.append(deadline)


        # Also detect dates like 10/20 or 10/20/2026
        dates = re.findall(
            r"\b\d{1,2}/\d{1,2}(?:/\d{2,4})?\b",
            line
        )

        for date in dates:

            if date not in deadlines:
                deadlines.append(date)


    # --------------------
    # FIND PROJECT NAME
    # --------------------

    project_name = "Project Update"


    for line in lines:

        lower_line = line.lower()

        if any(word in lower_line for word in project_words):

            project_name = line

            break


    # --------------------
    # SEND RESULTS TO REACT
    # --------------------

    return {
        "project": project_name,
        "actions": actions,
        "risks": risks,
        "deadlines": deadlines
    }