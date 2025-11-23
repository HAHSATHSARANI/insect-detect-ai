import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from gridfs import GridFS

# --------------------------
# MongoDB Connection Setup
# --------------------------
MONGODB_URI = os.environ.get(
    "MONGODB_URI",
    "mongodb+srv://sahandileepa52_db_user:VB26hdtySHLelRwZ@farmer.7y7emts.mongodb.net/?retryWrites=true&w=majority"
)

try:
    client = MongoClient(MONGODB_URI, server_api=ServerApi('1'))
    client.admin.command('ping')
    print("✓ Successfully connected to MongoDB!")
except Exception as e:
    print(f"⚠ Primary connection failed: {e}")
    client = MongoClient(MONGODB_URI, tlsAllowInvalidCertificates=True)
    client.admin.command('ping')
    print("✓ Connected with fallback method!")

db = client["FarmerDB"]
admins_collection = db["admins"]
insects_collection = db["insects"]
chat_collection = db["chats"]  # Collection for all chat messages
fs = GridFS(db)
