from flask import Flask, render_template, request, redirect, session, jsonify
from flask_cors import CORS, cross_origin
from models import db, User
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Simple CORS configuration that works
app.config['CORS_HEADERS'] = 'Content-Type'
CORS(app, supports_credentials=True, 
     resources={r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
     }})

# Use SQLite for testing (change back to PostgreSQL for production)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
# app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "postgresql://postgres:QBaWvXPIb7ftLOsX@db.echpoiaidsqcaynlygdk.supabase.co:5432/postgres")
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "073bb069e67008f68e33e565d92812db4ee2c02fc9ac2630c39ed30e4cd3e6fa")
app.config["SESSION_COOKIE_SAMESITE"] = "Lax"
app.config["SESSION_COOKIE_SECURE"] = False

db.init_app(app)

with app.app_context():
    db.create_all()

# Redirect root to React frontend
@app.route("/")
def home():
    return redirect("http://localhost:5173/login")

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
        return redirect("http://localhost:5173/game")

    return redirect("http://localhost:5173/signup")

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
            return redirect("http://localhost:5173/game")

        return jsonify({"error": "Invalid username or password"}), 401

    return redirect("http://localhost:5173/login")

@app.route("/game")
def game():
    if "user_id" not in session:
        return redirect("http://localhost:5173/login")

    return redirect("http://localhost:5173/game")

@app.route("/fall")
def fall():
    if "user_id" not in session:
        return redirect("http://localhost:5173/login")

    return redirect("http://localhost:5173/game")

@app.route("/winter")
def winter():
    if "user_id" not in session:
        return redirect("http://localhost:5173/login")

    return redirect("http://localhost:5173/game")

@app.route("/store")
def store():
    if "user_id" not in session:
        return redirect("http://localhost:5173/login")

    return redirect("http://localhost:5173/store")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("http://localhost:5173/login")

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
