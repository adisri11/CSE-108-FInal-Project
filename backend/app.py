from flask import Flask, render_template, request, redirect, session, jsonify
from flask_cors import CORS, cross_origin
from models import db, User
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# CORS configuration for Vercel deployment
app.config['CORS_HEADERS'] = 'Content-Type'
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')
FRONTEND_URL = os.environ.get('FRONTEND_URL')

# In production, FRONTEND_URL must be set
if ENVIRONMENT == 'production' and not FRONTEND_URL:
    raise ValueError("FRONTEND_URL environment variable is required for production deployment")

# Use localhost for development if not set
if not FRONTEND_URL:
    FRONTEND_URL = 'http://localhost:5173'

print(f"Environment: {ENVIRONMENT}")
print(f"Frontend URL: {FRONTEND_URL}")

CORS(app, supports_credentials=True, 
     resources={r"/*": {
        "origins": [FRONTEND_URL],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
     }})

# Database configuration - Use Supabase PostgreSQL for production
if ENVIRONMENT == 'production':
    # Supabase PostgreSQL connection
    db_url = os.environ.get('DATABASE_URL')
    if db_url and db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://')
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url or "postgresql://user:password@host/dbname"
else:
    # SQLite for local development
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"

app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = ENVIRONMENT == 'production'
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_pre_ping": True,
    "pool_recycle": 300,
}

db.init_app(app)

with app.app_context():
    db.create_all()

# Health check endpoint for Vercel
@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})

# Redirect root based on environment
@app.route("/")
def home():
    return jsonify({"status": "Maze Game Backend", "version": "1.0"})

# Keep auth routes but handle both form and JSON
@app.route("/signup", methods=["GET", "POST", "OPTIONS"])
@cross_origin(supports_credentials=True)
def signup():
    if request.method == "POST":
        # Handle JSON from React
        data = request.get_json() if request.is_json else None
        
        # Handle form data from Flask templates (fallback)
        username = data.get("username") if data else request.form.get("username")
        password = data.get("password") if data else request.form.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already exists"}), 400

        user = User(username=username)
        user.set_password(password)
        user.inventory = "jack_o_lantern"
        user.character = "jack_o_lantern"
        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id
        
        # Return JSON for React, or redirect for forms
        if request.is_json:
            return jsonify({"status": "success", "message": "Account created"})
        return redirect(f"{FRONTEND_URL}/game")

    return redirect(f"{FRONTEND_URL}/signup")

@app.route("/login", methods=["GET", "POST", "OPTIONS"])
@cross_origin(supports_credentials=True)
def login():
    if request.method == "POST":
        # Handle JSON from React
        data = request.get_json() if request.is_json else None
        
        # Handle form data from Flask templates (fallback)
        username = data.get("username") if data else request.form.get("username")
        password = data.get("password") if data else request.form.get("password")

        if not username or not password:
            return jsonify({"error": "Username and password required"}), 400

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session["user_id"] = user.id
            
            # Return JSON for React, or redirect for forms
            if request.is_json:
                return jsonify({"status": "success", "message": "Logged in"})
            return redirect(f"{FRONTEND_URL}/game")

        return jsonify({"error": "Invalid username or password"}), 401

    return redirect(f"{FRONTEND_URL}/login")

@app.route("/game")
def game():
    if "user_id" not in session:
        return redirect(f"{FRONTEND_URL}/login")
    return redirect(f"{FRONTEND_URL}/game")

@app.route("/fall")
def fall():
    if "user_id" not in session:
        return redirect(f"{FRONTEND_URL}/login")
    return redirect(f"{FRONTEND_URL}/game")

@app.route("/winter")
def winter():
    if "user_id" not in session:
        return redirect(f"{FRONTEND_URL}/login")
    return redirect(f"{FRONTEND_URL}/game")

@app.route("/store")
def store():
    if "user_id" not in session:
        return redirect(f"{FRONTEND_URL}/login")
    return redirect(f"{FRONTEND_URL}/store")

@app.route("/logout")
def logout():
    session.clear()
    return redirect(f"{FRONTEND_URL}/login")

@app.route("/fall/complete", methods=["POST"])
def fall_complete():
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.get_json()
    tokens = data.get("tokens", 0)

    user = User.query.get(session["user_id"])
    user.tokens += tokens
    db.session.commit()

    return jsonify({"status": "ok", "tokens": user.tokens})


# ===== API ENDPOINTS FOR FRONTEND =====

@app.route("/api/user", methods=["GET"])
def api_get_user():
    """Get current user data"""
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    user = User.query.get(session["user_id"])
    return jsonify({
        "id": user.id,
        "username": user.username,
        "tokens": user.tokens,
        "inventory": user.inventory.split(",") if user.inventory else [],
        "character": user.character if user.character else "jack_o_lantern"
    })

@app.route("/api/complete-maze", methods=["POST"])
def api_complete_maze():
    """Complete a maze and earn tokens"""
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.get_json()
    maze_type = data.get("maze", "fall")
    tokens_earned = data.get("tokens", 10)
    
    user = User.query.get(session["user_id"])
    user.tokens += tokens_earned
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "tokens": user.tokens,
        "message": f"Completed {maze_type} maze! Earned {tokens_earned} tokens"
    })

@app.route("/api/user/character", methods=["POST"])
def api_set_character():
    """Set user's active character"""
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.get_json()
    character_id = data.get("character")
    
    user = User.query.get(session["user_id"])
    
    # Check if user owns this character
    owned_items = user.inventory.split(",") if user.inventory else []
    if character_id != "jack_o_lantern" and character_id not in owned_items:
        return jsonify({"error": "Character not owned"}), 400
    
    user.character = character_id
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "character": user.character
    })

@app.route("/api/store/items", methods=["GET"])
def api_get_store_items():
    """Get all store items including characters"""
    items = [
        # Characters (IDs must match texture keys from preload)
        {"id": "jack_o_lantern", "name": "jack_o_lantern", "price": 0, "type": "character", "image": "jack_o_lantern.png"},
        {"id": "snowman", "name": "Snowman", "price": 100, "type": "character", "image": "snowman.png"},
        {"id": "santa_claus", "name": "Santa", "price": 50, "type": "character", "image": "santa_claus.png"},
        {"id": "reindeer", "name": "Reindeer", "price": 75, "type": "character", "image": "reindeer.png"},
        {"id": "scarecrow", "name": "Scarecrow", "price": 100, "type": "character", "image": "scarecrow.png"},
        {"id": "orange_ghost", "name": "Ghost", "price": 100, "type": "character", "image": "orange_ghost.png"},
        # Other items
    ]
    return jsonify(items)

@app.route("/api/store/buy", methods=["POST"])
def api_store_buy():
    """Buy an item from the store"""
    if "user_id" not in session:
        return jsonify({"error": "Not logged in"}), 401
    
    data = request.get_json()
    item_name = data.get("item")
    price = int(data.get("price"))
    
    user = User.query.get(session["user_id"])
    
    if user.tokens < price:
        return jsonify({"error": "Not enough tokens"}), 400
    
    user.tokens -= price
    
    if user.inventory:
        user.inventory += f",{item_name}"
    else:
        user.inventory = item_name
    
    db.session.commit()
    
    return jsonify({
        "status": "success",
        "tokens": user.tokens,
        "inventory": user.inventory.split(","),
        "message": f"Purchased {item_name}!"
    })


if __name__ == "__main__":
    app.run(debug=True)
