from dotenv import load_dotenv
import os

load_dotenv()

HOST = os.getenv("BACKEND_HOST") or "127.0.0.1"
PORT = int(os.getenv("BACKEND_PORT") or "4120")
