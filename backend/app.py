from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
import joblib
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Trained model load karo
model = joblib.load("spam_model.joblib")

def get_db():
    return mysql.connector.connect(
       host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
    )

def create_table():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            message TEXT NOT NULL,
            prediction VARCHAR(10) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    db.commit()
    cursor.close()
    db.close()

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    message = data.get("message", "").strip()

    if not message:
        return jsonify({"error": "Message khaali nahi ho sakta"}), 400

    # Model 'ham' ya 'spam' predict karta hai
    result = model.predict([message])[0]
    display_result = "Normal" if result == "ham" else "Spam"

    # Prediction MySQL mein save karo
    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        "INSERT INTO predictions (message, prediction) VALUES (%s, %s)",
        (message, display_result)
    )
    db.commit()
    cursor.close()
    db.close()

    return jsonify({"message": message, "prediction": display_result})

@app.route("/api/history", methods=["GET"])
def history():
    db = get_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("""
        SELECT id, message, prediction, created_at
        FROM predictions
        ORDER BY id DESC
        LIMIT 20
    """)

    records = cursor.fetchall()
    cursor.close()
    db.close()

    return jsonify(records)

if __name__ == "__main__":
    create_table()
    app.run(debug=True)