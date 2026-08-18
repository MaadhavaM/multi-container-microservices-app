from flask import Flask
from flask_cors import CORS
from database import init_db
from routes import notes_bp

app = Flask(__name__)
CORS(app)

# Register the routes blueprint
app.register_blueprint(notes_bp)

if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)