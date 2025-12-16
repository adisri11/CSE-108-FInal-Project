import sys
import os

# Add the parent directory to the path so we can import app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + "/..")

from app import app

# For Vercel serverless functions
def handler(request):
    with app.request_context(request.environ):
        return app.wsgi_app(request.environ, lambda *args: None)
