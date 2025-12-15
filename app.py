from flask import Flask, render_template, request, redirect, session
from models import db, User
import os
from dotenv import load_dotenv

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://postgres:QBaWvXPIb7ftLOsX@db.echpoiaidsqcaynlygdk.supabase.co:5432/postgres"
# app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///test.db"
app.config["SECRET_KEY"] = "073bb069e67008f68e33e565d92812db4ee2c02fc9ac2630c39ed30e4cd3e6fa"
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route("/")
def home():
    return redirect("/login")

@app.route("/signup", methods=["GET", "POST"])
def signup():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        if User.query.filter_by(username=username).first():
            return "Username already exists"

        user = User(username=username)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        session["user_id"] = user.id
        return redirect("/game")

    return render_template("signup.html")

@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"]
        password = request.form["password"]

        user = User.query.filter_by(username=username).first()

        if user and user.check_password(password):
            session["user_id"] = user.id
            return redirect("/game")

        return "Invalid login"

    return render_template("login.html")

@app.route("/game")
def game():
    if "user_id" not in session:
        return redirect("/login")

    user = User.query.get(session["user_id"])
    return render_template("intro.html", user=user)

@app.route("/add-token", methods=["POST"])
def add_token():
    if "user_id" not in session:
        return redirect("/login")

    user = User.query.get(session["user_id"])
    user.tokens += 10
    db.session.commit()

    return redirect("/game")

@app.route("/fall")
def fall():
    if "user_id" not in session:
        return redirect("/login")

    return redirect("http://localhost:5173")

@app.route("/fall/complete", methods=["POST"])
def fall_complete():
    data = request.get_json()
    tokens = data.get("tokens", 0)

    user = User.query.get(session["user_id"])
    user.tokens += tokens
    db.session.commit()

    return {"status": "ok"}


# STORE SYSTEM - Joshua Freitas
@app.route("/store")
def store():
    if "user_id" not in session:
        return redirect("/login")

    user = User.query.get(session["user_id"])

    items = [
        {"name": "item 1", "price": 20},
        {"name": "item 2", "price": 35},
        {"name": "item 3", "price": 50},
    ]

    return render_template("store.html", user=user, items=items)

@app.route("/store/buy", methods=["POST"])
def store_buy():
    if "user_id" not in session:
        return redirect("/login")

    item = request.form.get("item")
    price = int(request.form.get("price"))

    user = User.query.get(session["user_id"])

    if user.tokens < price:
        return "Not enough tokens!"

    user.tokens -= price

    if user.inventory:
        user.inventory += f",{item}"
    else:
        user.inventory = item

    db.session.commit()

    return redirect("/store")

@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")

@app.route("/winter")
def winter():
    return "Winter maze goes here"

if __name__ == "__main__":
    app.run(debug=True)
