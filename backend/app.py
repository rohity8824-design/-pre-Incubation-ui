import os
import sqlite3
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app, origins="*")

# ======================================
# EMAIL CONFIGURATION
# ======================================
SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SENDER_EMAIL = 'rohity8824@gmail.com'
SENDER_PASSWORD = 'eympqxrusnzifzds'
ADMIN_EMAIL = 'rohity8824@gmail.com'

def try_sending_email(recipient, subject, html_content):
    try:
        msg = MIMEMultipart()
        msg['From'] = f"AIC Team <{SENDER_EMAIL}>"
        msg['To'] = recipient
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_content, 'html'))
            
        # Connect with a strict timeout so UI never freezes
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT, timeout=4)
        server.starttls()
        server.login(SENDER_EMAIL, SENDER_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipient, msg.as_string())
        server.quit()
        print(f"--> [SMTP SUCCESS] Sent to {recipient}")
    except Exception as e:
        # Render network block handle karne ke liye (Jaise Errno 101)
        print(f"--> [SMTP LOG] Mail to {recipient} skipped due to Render Environment Port Block: {str(e)}")

# ======================================
# DATABASE HELPER FUNCTION
# ======================================
def get_db_connection():
    conn = sqlite3.connect('startups.db', timeout=30)
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
    return "Backend Live - Multi-Template Active"

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

        # Save to SQLite Database
        conn = get_db_connection()
        conn.execute(
            '''INSERT INTO startups
            (startup_name, founder_name, email, sector, pitch_deck, resume, pan_card, certificate, business_plan)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (startup_name, founder_name, email, sector, pitch_deck_name, resume_name, pan_card_name, certificate_name, business_plan_name)
        )
        conn.commit()
        conn.close() 

        # 1. USER MAIL TEMPLATE (Jaise pehle jati thi)
        user_html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h2 style="color: #1a73e8;">AIC Pre-Incubation Application Submitted</h2>
            <p>Hello <b>{founder_name}</b>,</p>
            <p>Your startup application has been submitted successfully.</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p><b>Startup Name:</b> {startup_name}</p>
            <p><b>Sector:</b> {sector}</p>
            <p><b>Uploaded Pitch Deck:</b> {pitch_deck_name}</p>
            <hr style="border: 0; border-top: 1px solid #eee;" />
            <p>Thank you for applying to the AIC Pre-Incubation Program.</p>
            <p>Regards,<br><b>AIC Team</b></p>
        </div>
        """
        try_sending_email(email, 'AIC Pre-Incubation Application Submitted', user_html)

        # 2. ADMIN MAIL TEMPLATE (Alag subject aur alert ke saath)
        admin_html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; border-left: 4px solid #f44336;">
            <h2 style="color: #f44336;">New Startup Registration Alert</h2>
            <p>An application has been received for the Pre-Incubation portal:</p>
            <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Startup Name:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{startup_name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Founder Name:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{founder_name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Email Address:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{email}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Sector:</b></td><td style="padding: 8px; border-bottom: 1px solid #eee;">{sector}</td></tr>
            </table>
            <p>Please log in to the admin dashboard to review the uploaded documents.</p>
        </div>
        """
        try_sending_email(ADMIN_EMAIL, f'ALERT: New Startup Registered - {startup_name}', admin_html)

        return jsonify({"message": "Application Submitted Successfully!"}), 200

    except Exception as e:
        print("CRITICAL ERROR:", str(e))
        return jsonify({"error": f"Server Error: {str(e)}"}), 500

@app.route('/startups', methods=['GET'])
def get_startups():
    conn = get_db_connection()
    rows = conn.execute("SELECT * FROM startups").fetchall()
    conn.close()
    return jsonify([dict(row) for row in rows])

@app.route('/download/<filename>', methods=['GET'])
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename, as_attachment=False)

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

    # STATUS UPDATE MAIL TEMPLATE
    status_html = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2>Startup Application Update</h2>
        <p>Hello <b>{startup['founder_name']}</b>,</p>
        <p>Your application for the startup <b>{startup['startup_name']}</b> has been reviewed.</p>
        <p style="font-size: 16px;">Current Status: <span style="font-weight: bold; color: #1a73e8;">{status}</span></p>
        <hr style="border: 0; border-top: 1px solid #eee;" />
        <p>Regards,<br><b>AIC Team</b></p>
    </div>
    """
    try_sending_email(startup["email"], f"Startup Application {status}", status_html)

    return jsonify({"message": f"Status Updated to {status}"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host="0.0.0.0", port=port, debug=False)