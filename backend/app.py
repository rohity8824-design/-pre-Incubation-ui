import os
import sqlite3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

app = Flask(__name__)
app = Flask(__name__)
CORS(app, origins="*")

# Database connection with WAL mode
def get_db_connection():
    conn = sqlite3.connect('startups.db', timeout=20, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn
CORS(app, origins="*")

# ======================================
# EMAIL CONFIGURATION
# ======================================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True

# YOUR GMAIL
app.config['MAIL_USERNAME'] = 'usaai4279@gmail.com'

# NEW GOOGLE APP PASSWORD (WITHOUT SPACES)
app.config['MAIL_PASSWORD'] = 'bhbtlckyucwxcwzz'

mail = Mail(app)

# ADMIN EMAIL
ADMIN_EMAIL = 'Rohity8824@gmail.com'

# ======================================
# FILE UPLOAD CONFIGURATION
# ======================================
UPLOAD_FOLDER = 'uploads'

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# ======================================
# DATABASE HELPER FUNCTION
# ======================================
def get_db_connection():
    conn = sqlite3.connect('startups.db', timeout=20, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db_connection()
    conn.execute('''
    CREATE TABLE IF NOT EXISTS startups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        startup_name TEXT,
        founder_name TEXT,
        email TEXT,
        sector TEXT,
        pitch_deck TEXT,
        resume TEXT,
        pan_card TEXT,
        certificate TEXT,
        business_plan TEXT,
        status TEXT DEFAULT 'Pending'
    )
    ''')
    conn.commit()
    conn.close()

# INITIALIZE DATABASE
init_db()

# ======================================
# HOME ROUTE
# ======================================
@app.route('/')
def home():
    return "Backend Running Successfully"

# ======================================
# REGISTER ROUTE
# ======================================
@app.route('/register', methods=['POST'])
def register():
    try:
        startup_name = request.form.get('startupName')
        founder_name = request.form.get('founderName')
        email = request.form.get('email')
        sector = request.form.get('sector')

        required_files = [
            'pitchDeck',
            'resume',
            'panCard',
            'certificate',
            'businessPlan'
        ]

        for f in required_files:
            if f not in request.files:
                return jsonify({"error": f"{f} is missing"}), 400

        pitch_deck = request.files['pitchDeck']
        resume = request.files['resume']
        pan_card = request.files['panCard']
        certificate = request.files['certificate']
        business_plan = request.files['businessPlan']

        # PDF validation
        if not pitch_deck.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Pitch Deck must be PDF"}), 400

        if not resume.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Resume must be PDF"}), 400

        if not business_plan.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Business Plan must be PDF"}), 400

        pitch_deck_name = secure_filename(pitch_deck.filename)
        resume_name = secure_filename(resume.filename)
        pan_card_name = secure_filename(pan_card.filename)
        certificate_name = secure_filename(certificate.filename)
        business_plan_name = secure_filename(business_plan.filename)

        pitch_deck.save(os.path.join(app.config['UPLOAD_FOLDER'], pitch_deck_name))
        resume.save(os.path.join(app.config['UPLOAD_FOLDER'], resume_name))
        pan_card.save(os.path.join(app.config['UPLOAD_FOLDER'], pan_card_name))
        certificate.save(os.path.join(app.config['UPLOAD_FOLDER'], certificate_name))
        business_plan.save(os.path.join(app.config['UPLOAD_FOLDER'], business_plan_name))

        conn = get_db_connection()
        conn.execute(
            '''
            INSERT INTO startups
            (
                startup_name,
                founder_name,
                email,
                sector,
                pitch_deck,
                resume,
                pan_card,
                certificate,
                business_plan
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''',
            (
                startup_name,
                founder_name,
                email,
                sector,
                pitch_deck_name,
                resume_name,
                pan_card_name,
                certificate_name,
                business_plan_name
            )
        )
        conn.commit()
        conn.close()

        base_url = "http://172.17.135.134:5000"
        pitch_link = f"{base_url}/download/{pitch_deck_name}"
        resume_link = f"{base_url}/download/{resume_name}"
        pan_link = f"{base_url}/download/{pan_card_name}"
        certificate_link = f"{base_url}/download/{certificate_name}"
        business_link = f"{base_url}/download/{business_plan_name}"

        # Applicant Email
        msg = Message(
            subject='AIC Pre-Incubation Application Submitted',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.html = f"""
        <h2>Application Submitted Successfully</h2>
        <p>Hello {founder_name},</p>
        <p>Your startup application has been submitted successfully.</p>
        <p><b>Startup Name:</b> {startup_name}</p>
        <p><b>Sector:</b> {sector}</p>
        <p><a href="{pitch_link}">View Pitch Deck</a></p>
        <p><a href="{resume_link}">View Resume</a></p>
        <p><a href="{pan_link}">View PAN Card</a></p>
        <p><a href="{certificate_link}">View Certificate</a></p>
        <p><a href="{business_link}">View Business Plan</a></p>
        <p>Regards,<br>AIC Team</p>
        """
        mail.send(msg)

        # Admin Email
        admin_msg = Message(
            subject=f'New Startup Application - {startup_name}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[ADMIN_EMAIL]
        )
        admin_msg.html = f"""
        <h2>New Startup Application</h2>
        <p><b>Startup Name:</b> {startup_name}</p>
        <p><b>Founder Name:</b> {founder_name}</p>
        <p><b>Founder Email:</b> {email}</p>
        <p><b>Sector:</b> {sector}</p>
        <p><a href="{pitch_link}">View Pitch Deck</a></p>
        <p><a href="{resume_link}">View Resume</a></p>
        <p><a href="{pan_link}">View PAN Card</a></p>
        <p><a href="{certificate_link}">View Certificate</a></p>
        <p><a href="{business_link}">View Business Plan</a></p>
        <p>Regards,<br>AIC Automated System</p>
        """
        mail.send(admin_msg)

        return jsonify({"message": "Application Submitted Successfully & Emails Sent"}), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

# ======================================
# GET STARTUPS
# ======================================
@app.route('/startups', methods=['GET'])
def get_startups():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM startups").fetchall()
    conn.close()

    startups = []
    for row in rows:
        startups.append(dict(row))
    return jsonify(startups)

# ======================================
# DOWNLOAD FILE
# ======================================
@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        as_attachment=False
    )

# ======================================
# UPDATE STATUS
# ======================================
@app.route('/update-status/<int:id>', methods=['POST'])
def update_status(id):
    data = request.json
    if not data:
        return jsonify({"error": "No data received"}), 400

    status = data.get('status')
    if not status:
        return jsonify({"error": "Status is required"}), 400

    conn = get_db_connection()
    startup = conn.execute("SELECT * FROM startups WHERE id = ?", (id,)).fetchone()
    
    if not startup:
        conn.close()
        return jsonify({"error": "Startup not found"}), 404

    conn.execute(
        '''
        UPDATE startups
        SET status = ?
        WHERE id = ?
        ''',
        (status, id)
    )

    # Approval / Rejection Emails Logic Fixed
    if status == "Approved":
        msg = Message(
            subject="Startup Application Approved",
            sender=app.config['MAIL_USERNAME'],
            recipients=[startup["email"]]
        )
        msg.body = f"""Hello {startup['founder_name']},

Congratulations!
Your startup application has been APPROVED.

Startup Name: {startup['startup_name']}
Sector: {startup['sector']}

Regards,
AIC Team"""
        mail.send(msg)

    elif status == "Rejected":
        msg = Message(
            subject="Startup Application Rejected",
            sender=app.config['MAIL_USERNAME'],
            recipients=[startup["email"]]
        )
        msg.body = f"""Hello {startup['founder_name']},

We regret to inform you that your startup application has been rejected.

Startup Name: {startup['startup_name']}

Regards,
AIC Team"""
        mail.send(msg)

    conn.commit()
    conn.close()

    return jsonify({"message": f"Status Updated to {status}"}), 200

# ======================================
# RUN APP
# ======================================
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)