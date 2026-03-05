from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import uuid
import random
import math
import csv
from io import StringIO

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODELS ---
class Faculty(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    short_code = db.Column(db.String(10), nullable=False)
    department = db.Column(db.String(50), nullable=False)
    max_hours_per_day = db.Column(db.Integer, nullable=False)
    availability = db.Column(db.JSON, nullable=False) 

class Room(db.Model):
    id = db.Column(db.String, primary_key=True)
    room_number = db.Column(db.String(20), nullable=False)
    capacity = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(50), nullable=False)
    building = db.Column(db.String(50), nullable=False)

class Subject(db.Model):
    id = db.Column(db.String, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    credits = db.Column(db.Integer, nullable=False)
    type = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    faculty_id = db.Column(db.String, nullable=True)
    color = db.Column(db.String(20), nullable=True)

class ClassSection(db.Model):
    id = db.Column(db.String, primary_key=True)
    section_name = db.Column(db.String(20), nullable=False)
    semester = db.Column(db.Integer, nullable=False)
    department = db.Column(db.String(50), nullable=False)
    student_strength = db.Column(db.Integer, nullable=False)

class TimetableEntry(db.Model):
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    day = db.Column(db.String(20), nullable=False)
    slot_index = db.Column(db.Integer, nullable=False)
    subject_id = db.Column(db.String, nullable=False)
    faculty_id = db.Column(db.String, nullable=False)
    room_id = db.Column(db.String, nullable=False)
    class_id = db.Column(db.String, nullable=False)
    is_lab = db.Column(db.Boolean, default=False)
    is_locked = db.Column(db.Boolean, default=False) 

with app.app_context():
    db.create_all()

# --- EXPORT ROUTES ---
@app.route('/api/export/csv', methods=['GET'])
def export_csv():
    si = StringIO()
    cw = csv.writer(si)
    cw.writerow(['Day', 'Slot', 'Subject', 'Faculty', 'Room', 'Section'])
    
    entries = TimetableEntry.query.all()
    subjects = {s.id: s for s in Subject.query.all()}
    faculties = {f.id: f for f in Faculty.query.all()}
    rooms = {r.id: r for r in Room.query.all()}
    classes = {c.id: c for c in ClassSection.query.all()}

    for e in entries:
        cw.writerow([
            e.day, e.slot_index, 
            subjects.get(e.subject_id).name if e.subject_id in subjects else "Unknown",
            faculties.get(e.faculty_id).short_code if e.faculty_id in faculties else "??",
            rooms.get(e.room_id).room_number if e.room_id in rooms else "??",
            classes.get(e.class_id).section_name if e.class_id in classes else "??"
        ])
    
    response = make_response(si.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=college_timetable.csv"
    response.headers["Content-type"] = "text/csv"
    return response

# --- CORE API ROUTES ---
@app.route('/api/faculty', methods=['GET', 'POST'])
def manage_faculty():
    if request.method == 'GET':
        return jsonify([{'id': f.id, 'name': f.name, 'shortCode': f.short_code, 'department': f.department, 'availability': f.availability, 'maxHoursPerDay': f.max_hours_per_day} for f in Faculty.query.all()])
    data = request.json
    db.session.add(Faculty(id=data['id'], name=data['name'], short_code=data['shortCode'], department=data['department'], max_hours_per_day=data['maxHoursPerDay'], availability=data['availability']))
    db.session.commit()
    return jsonify({"m": "ok"}), 201

@app.route('/api/subjects', methods=['GET', 'POST'])
def manage_subjects():
    if request.method == 'GET':
        return jsonify([{'id': s.id, 'name': s.name, 'code': s.code, 'credits': s.credits, 'type': s.type, 'semester': s.semester, 'department': s.department, 'facultyId': s.faculty_id, 'color': s.color} for s in Subject.query.all()])
    data = request.json
    db.session.add(Subject(id=data['id'], name=data['name'], code=data['code'], credits=data['credits'], type=data['type'], semester=data['semester'], department=data['department'], faculty_id=data.get('facultyId'), color=data.get('color')))
    db.session.commit()
    return jsonify({"m": "ok"}), 201

@app.route('/api/classes', methods=['GET', 'POST'])
def manage_classes():
    if request.method == 'GET':
        return jsonify([{'id': c.id, 'sectionName': c.section_name, 'semester': c.semester, 'department': c.department, 'studentStrength': c.student_strength} for c in ClassSection.query.all()])
    data = request.json
    db.session.add(ClassSection(id=data['id'], section_name=data['sectionName'], semester=data['semester'], department=data['department'], student_strength=data['studentStrength']))
    db.session.commit()
    return jsonify({"m": "ok"}), 201

@app.route('/api/rooms', methods=['GET', 'POST'])
def manage_rooms():
    if request.method == 'GET':
        return jsonify([{'id': r.id, 'roomNumber': r.room_number, 'capacity': r.capacity, 'type': r.type, 'building': r.building} for r in Room.query.all()])
    data = request.json
    db.session.add(Room(id=data['id'], room_number=data['roomNumber'], capacity=data['capacity'], type=data['type'], building=data['building']))
    db.session.commit()
    return jsonify({"m": "ok"}), 201

@app.route('/api/timetable', methods=['GET', 'POST'])
def manage_timetable():
    if request.method == 'GET':
        return jsonify([{'id': e.id, 'day': e.day, 'slotIndex': e.slot_index, 'subjectId': e.subject_id, 'facultyId': e.faculty_id, 'roomId': e.room_id, 'classId': e.class_id, 'isLab': e.is_lab, 'isLocked': e.is_locked} for e in TimetableEntry.query.all()])
    data = request.json
    db.session.add(TimetableEntry(id=str(uuid.uuid4()), day=data['day'], slot_index=data['slotIndex'], subject_id=data['subjectId'], faculty_id=data['facultyId'], room_id=data['roomId'], class_id=data['classId'], is_lab=data.get('isLab', False), is_locked=True))
    db.session.commit()
    return jsonify({"m": "ok"}), 201

# --- DELETE ROUTES ---
@app.route('/api/faculty/<id>', methods=['DELETE'])
def delete_faculty(id):
    TimetableEntry.query.filter_by(faculty_id=id).delete()
    Faculty.query.filter_by(id=id).delete()
    db.session.commit()
    return jsonify({"success": True}), 200

@app.route('/api/subjects/<id>', methods=['DELETE'])
def delete_subject(id):
    TimetableEntry.query.filter_by(subject_id=id).delete()
    Subject.query.filter_by(id=id).delete()
    db.session.commit()
    return jsonify({"success": True}), 200

@app.route('/api/classes/<id>', methods=['DELETE'])
def delete_class(id):
    TimetableEntry.query.filter_by(class_id=id).delete()
    ClassSection.query.filter_by(id=id).delete()
    db.session.commit()
    return jsonify({"success": True}), 200

@app.route('/api/rooms/<id>', methods=['DELETE'])
def delete_room(id):
    TimetableEntry.query.filter_by(room_id=id).delete()
    Room.query.filter_by(id=id).delete()
    db.session.commit()
    return jsonify({"success": True}), 200

# --- GENERATION AI ---
@app.route('/api/generate', methods=['POST'])
def generate_timetable():
    try:
        faculties = {f.id: f for f in Faculty.query.all()}
        subjects = Subject.query.all()
        rooms = Room.query.all()
        classes = ClassSection.query.all()

        if not rooms:
            return jsonify({"success": False, "conflicts": ["Add rooms first!"]}), 200

        TimetableEntry.query.filter_by(is_locked=False).delete()
        db.session.commit()

        locked = TimetableEntry.query.filter_by(is_locked=True).all()
        faculty_occupied, room_occupied, class_occupied, faculty_daily_hours = {}, {}, {}, {}
        conflicts = [] 

        def get_key(d, s): return f"{d}-{s}"
        
        for e in locked:
            k = get_key(e.day, e.slot_index)
            faculty_occupied.setdefault(e.faculty_id, set()).add(k)
            room_occupied.setdefault(e.room_id, set()).add(k)
            class_occupied.setdefault(e.class_id, set()).add(k)
            faculty_daily_hours.setdefault(e.faculty_id, {})
            faculty_daily_hours[e.faculty_id][e.day] = faculty_daily_hours[e.faculty_id].get(e.day, 0) + 1

        DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
        TEACHING_SLOTS = [0, 1, 3, 4, 6, 7] 
        BLOCKS = [(0, 1), (3, 4), (6, 7)] 

        for cls in classes:
            cls_subjects = [s for s in subjects if s.semester == cls.semester and s.department == cls.department]
            
            def requires_block(sub):
                return sub.type.lower() in ['lab', 'project', 'co-curricular', 'practical']
                
            cls_subjects.sort(key=lambda x: (requires_block(x), int(x.credits)), reverse=True)
            
            for sub in cls_subjects:
                if not sub.faculty_id or sub.faculty_id not in faculties: 
                    conflicts.append(f"Skipped {sub.name}: Missing Faculty")
                    continue
                    
                fac = faculties[sub.faculty_id]
                is_block_req = requires_block(sub)
                
                eligible_rooms = [r for r in rooms if r.type.lower() == sub.type.lower()] 
                if not eligible_rooms: eligible_rooms = rooms 
                
                shuffled_days = DAYS.copy()
                random.shuffle(shuffled_days)

                if is_block_req:
                    needed_blocks = math.ceil(int(sub.credits) / 2) 
                    placed_blocks = 0
                    
                    for day in shuffled_days:
                        if placed_blocks >= needed_blocks: break
                        for s1, s2 in BLOCKS:
                            k1, k2 = get_key(day, s1), get_key(day, s2)
                            # Relaxed check: Only enforce hard constraints (is the teacher physically busy?)
                            if k1 in faculty_occupied.get(fac.id, set()) or k2 in faculty_occupied.get(fac.id, set()): continue
                            if k1 in class_occupied.get(cls.id, set()) or k2 in class_occupied.get(cls.id, set()): continue
                            
                            selected_room = next((r for r in eligible_rooms if k1 not in room_occupied.get(r.id, set()) and k2 not in room_occupied.get(r.id, set())), None)
                            
                            if selected_room:
                                db.session.add(TimetableEntry(id=str(uuid.uuid4()), day=day, slot_index=s1, subject_id=sub.id, faculty_id=fac.id, room_id=selected_room.id, class_id=cls.id, is_lab=True))
                                db.session.add(TimetableEntry(id=str(uuid.uuid4()), day=day, slot_index=s2, subject_id=sub.id, faculty_id=fac.id, room_id=selected_room.id, class_id=cls.id, is_lab=True))
                                
                                for k in [k1, k2]:
                                    faculty_occupied.setdefault(fac.id, set()).add(k)
                                    room_occupied.setdefault(selected_room.id, set()).add(k)
                                    class_occupied.setdefault(cls.id, set()).add(k)
                                placed_blocks += 1
                                break 
                                
                    if placed_blocks < needed_blocks: conflicts.append(f"{sub.name}: Missed {needed_blocks - placed_blocks} lab blocks")

                else:
                    needed_slots = int(sub.credits)
                    placed = 0
                    for day in shuffled_days:
                        if placed >= needed_slots: break
                        for slot in TEACHING_SLOTS:
                            if placed >= needed_slots: break
                            k = get_key(day, slot)
                            if k in faculty_occupied.get(fac.id, set()) or k in class_occupied.get(cls.id, set()): continue
                            
                            selected_room = next((r for r in eligible_rooms if k not in room_occupied.get(r.id, set())), None)
                            
                            if selected_room:
                                db.session.add(TimetableEntry(id=str(uuid.uuid4()), day=day, slot_index=slot, subject_id=sub.id, faculty_id=fac.id, room_id=selected_room.id, class_id=cls.id, is_lab=False))
                                faculty_occupied.setdefault(fac.id, set()).add(k)
                                room_occupied.setdefault(selected_room.id, set()).add(k)
                                class_occupied.setdefault(cls.id, set()).add(k)
                                placed += 1
                                
                    if placed < needed_slots: conflicts.append(f"{sub.name}: Missed {needed_slots - placed} classes")

        db.session.commit()
        return jsonify({"success": len(conflicts) == 0, "conflicts": conflicts}), 200

    except Exception as e:
        print("CRASH ERROR:", str(e))
        return jsonify({"success": False, "conflicts": [f"Backend Error: {str(e)}"]}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)