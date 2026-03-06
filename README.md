# 📅 Academic Timetable Management System

A full-stack web application built to streamline, manage, and automate academic scheduling for St. Vincent Pallotti College of Engineering and Technology. This system replaces manual scheduling with a rule-based algorithm that prevents overlapping classes and strictly adheres to college-specific time structures.

## ✨ Key Features

* **Algorithmic Scheduling Engine:** Automatically generates conflict-free schedules by matching faculty availability, room capacity, and course credits.
* **Smart Block Allocation:** Strictly enforces consecutive 2-hour blocks for Labs, Practicals, and Co-curricular activities to prevent schedule fragmentation.
* **Comprehensive Dashboard:** Full management interfaces to add, edit, and delete Faculty, Subjects, Rooms, and Class Sections.
* **Credit-Based Logic:** Accurately maps course credits to weekly class hours (e.g., a 4-credit subject receives exactly four 1-hour slots).
* **Data Export:** Download the final generated timetable as a raw CSV data file or a print-ready formatted PDF.

---

## 🛠️ Technology Stack

* **Frontend:** React.js, TypeScript, Tailwind CSS, Vite
* **Backend:** Python, Flask, Flask-CORS
* **Database:** PostgreSQL (via SQLAlchemy ORM)

---

## 🚀 How to Run Locally

### 1. Backend Setup (Flask API)
Navigate to the backend directory and set up your Python environment:
```bash
# Install required dependencies
pip install flask flask-sqlalchemy flask-cors psycopg2-binary

# Start the development server
python app.py

----
