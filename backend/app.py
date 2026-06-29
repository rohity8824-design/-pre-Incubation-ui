import os
import sqlite3
import threading
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_mail import Mail, Message
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins="*")

# ======================================
# EMAIL CONFIGURATION (RE-VERIFIED)
# ======================================
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 465  # <-- 587 se badal kar 465 kiya (More stable for Render)
app.config['MAIL_USE_TLS'] = False
app.config['MAIL_USE_SSL'] = True   # <-- SSL ON kiya
app.config['MAIL_USERNAME'] = 'usaai4279@gmail.com'
app.config['MAIL_PASSWORD'] = 'bhbtlckyucwxcwzz'

mail = Mail(app)
ADMIN_EMAIL = 'Rohity8824@gmail.com'

# ======================================
# BACKGROUND EMAIL HELPER (WITH BETTER ERROR LOGGING)
# ======================================
def send_async_email(flask_app, msg):
    with flask_app.app_context():
        try:
            mail.send(msg)
            print("!!! EMAIL SENT SUCCESSFULLY !!!")  # <-- Logs mein check karne ke liye
        except Exception as e:
            print("!!! ASYNC MAIL CRITICAL ERROR !!!:", str(e))  # <-- Asli wajah yahan print hogi

# ======================================
# DATABASE HELPER FUNCTION
# ======================================
def get_db_connection():
    conn = sqlite3.connect('startups.db', timeout=30, check_same_thread=False)
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA busy_timeout=30000")
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

try:
    conn = sqlite3.connect('startups.db', timeout=30)
    conn.execute("PRAGMA integrity_check")
    conn.close()
except:
    if os.path.exists('startups.db'):
        os.remove('startups.db')
    init_db()

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

        required_files = ['pitchDeck', 'resume', 'panCard', 'certificate', 'businessPlan']
        for f in required_files:
            if f not in request.files:
                return jsonify({"error": f"{f} is missing"}), 400

        pitch_deck = request.files['pitchDeck']
        resume = request.files['resume']
        pan_card = request.files['panCard']
        certificate = request.files['certificate']
        business_plan = request.files['businessPlan']

        if not pitch_deck.filename.lower().endswith('.pdf') or not resume.filename.lower().endswith('.pdf') or not business_plan.filename.lower().endswith('.pdf'):
            return jsonify({"error": "Required files must be PDF"}), 400

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
            '''INSERT INTO startups
            (startup_name, founder_name, email, sector, pitch_deck, resume, pan_card, certificate, business_plan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (startup_name, founder_name, email, sector, pitch_deck_name, resume_name, pan_card_name, certificate_name, business_plan_name)
        )
        conn.commit()
        conn.close()

        base_url = "https://pre-incubation-backend.onrender.com"
        pitch_link = f"{base_url}/download/{pitch_deck_name}"
        resume_link = f"{base_url}/download/{resume_name}"
        pan_link = f"{base_url}/download/{pan_card_name}"
        certificate_link = f"{base_url}/download/{certificate_name}"
        business_link = f"{base_url}/download/{business_plan_name}"

        # --- User Email ---
        msg = Message(
            subject='AIC Pre-Incubation Application Submitted',
            sender=app.config['MAIL_USERNAME'],
            recipients=[email]
        )
        msg.html = f"""<h2>Application Submitted Successfully</h2><p>Hello {founder_name},</p><p>Your startup application for <b>{startup_name}</b> has been received.</p>"""
        
        # Pass current_app context properly
        threading.Thread(target=send_async_email, args=(app, msg)).start()

        # --- Admin Email ---
        admin_msg = Message(
            subject=f'New Startup Application - {startup_name}',
            sender=app.config['MAIL_USERNAME'],
            recipients=[ADMIN_EMAIL]
        )
        admin_msg.html = f"""<h2>New Startup Application</h2><p><b>Startup Name:</b> {startup_name}</p><p><b>Founder:</b> {founder_name}</p>"""
        
        threading.Thread(target=send_async_email, args=(app, admin_msg)).start()

        return jsonify({"message": "Application Submitted Successfully & Emails Triggered"}), 200

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({"error": str(e)}), 500

@app.route('/startups', methods=['GET'])
def get_startups():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM startups").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

# ======================================
# UPDATE STATUS
# ======================================
@app.route('/update-status/<int:id>', methods=['POST'])
def update_status(id):
    data = request.json
    if not data or 'status' not in data:
        return jsonify({"error": "Status is required"}), 400

    status = data.get('status')
    conn = get_db_connection()
    startup = conn.execute("SELECT * FROM startups WHERE id = ?", (id,)).fetchone()
    
    if not startup:
        conn.close()
        return jsonify({"error": "Startup not found"}), 404

    conn.execute("UPDATE startups SET status = ? WHERE id = ?", (status, id))
    conn.commit()
    conn.close()

    msg = Message(
        subject=f"Startup Application {status}",
        sender=app.config['MAIL_USERNAME'],
        recipients=[startup["email"]]
    )
    msg.body = f"Hello {startup['founder_name']},\n\nYour application for {startup['startup_name']} has been {status}.\n\nRegards,\nAIC Team"
    
    threading.Thread(target=send_async_email, args=(app, msg)).start()

    return jsonify({"message": f"Status Updated to {status}"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False)