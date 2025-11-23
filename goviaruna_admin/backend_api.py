from fastapi import FastAPI, UploadFile, File, HTTPException, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from pymongo import MongoClient
from pymongo.server_api import ServerApi
from gridfs import GridFS
from bson import ObjectId
import io
import os
import hashlib
from datetime import datetime

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

# --------------------------
# Pydantic Models
# --------------------------
class AdminBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Admin"
    isActive: bool = True
    imageUrl: Optional[str] = None

class AdminCreate(AdminBase):
    password: str

class AdminUpdate(AdminBase):
    password: Optional[str] = None

class Admin(AdminBase):
    id: str

class Insect(BaseModel):
    id: Optional[str] = None
    name: str
    scientificName: str
    description: str
    image: Optional[str] = None
    images: Optional[List[str]] = []
    category: str
    confidence: float = 95

class AuthModel(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None

# Chat Models
class ChatMessage(BaseModel):
    id: Optional[str] = None
    username: str      # The user this chat belongs to
    sender: str        # 'user' or 'admin'
    content: str
    timestamp: Optional[datetime] = None
    read: bool = False  # NEW: Track read status

class ChatMessageCreate(BaseModel):
    username: str
    content: str
    sender: str = "user"  # Default to user for the test page

# --------------------------
# FastAPI App
# --------------------------
app = FastAPI(title="Farmer Admin API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --------------------------
# Helper Functions
# --------------------------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def admin_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc.get("role", "Admin"),
        "isActive": doc.get("isActive", True),
        "imageUrl": doc.get("imageUrl", "")
    }

def insect_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "scientificName": doc["scientificName"],
        "description": doc["description"],
        "image": doc.get("image", ""),
        "images": doc.get("images", []),
        "category": doc["category"],
        "confidence": doc.get("confidence", 95)
    }

def chat_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "sender": doc["sender"],
        "content": doc["content"],
        "timestamp": doc.get("timestamp", datetime.utcnow()),
        "read": doc.get("read", False)  # NEW: Include read status
    }

# --------------------------
# Root & Health
# --------------------------
@app.get("/")
def root():
    return {"message": "Farmer Admin API running", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    try:
        client.admin.command('ping')
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}

# --------------------------
# Admin CRUD
# --------------------------
@app.get("/api/admins", response_model=List[Admin])
def get_admins():
    return [admin_helper(a) for a in admins_collection.find()]

@app.post("/api/admins", response_model=Admin)
def create_admin(admin: AdminCreate):
    if admins_collection.find_one({"email": admin.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    doc = admin.dict()
    doc["password"] = hash_password(doc["password"])
    result = admins_collection.insert_one(doc)
    return admin_helper(admins_collection.find_one({"_id": result.inserted_id}))

@app.put("/api/admins/{admin_id}", response_model=Admin)
def update_admin(admin_id: str, admin: AdminUpdate):
    data = admin.dict(exclude_unset=True)
    if "password" in data and data["password"]:
        data["password"] = hash_password(data["password"])
    result = admins_collection.update_one({"_id": ObjectId(admin_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin_helper(admins_collection.find_one({"_id": ObjectId(admin_id)}))

@app.delete("/api/admins/{admin_id}")
def delete_admin(admin_id: str):
    result = admins_collection.delete_one({"_id": ObjectId(admin_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted successfully"}

# --------------------------
# Insects CRUD
# --------------------------
@app.get("/api/insects", response_model=List[Insect])
def get_insects():
    return [insect_helper(i) for i in insects_collection.find()]

@app.post("/api/insects", response_model=Insect)
def create_insect(insect: Insect):
    doc = insect.dict(exclude={"id"})
    result = insects_collection.insert_one(doc)
    return insect_helper(insects_collection.find_one({"_id": result.inserted_id}))

@app.put("/api/insects/{insect_id}", response_model=Insect)
def update_insect(insect_id: str, insect: Insect):
    data = insect.dict(exclude_unset=True, exclude={"id"})
    result = insects_collection.update_one({"_id": ObjectId(insect_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Insect not found")
    return insect_helper(insects_collection.find_one({"_id": ObjectId(insect_id)}))

@app.delete("/api/insects/{insect_id}")
def delete_insect(insect_id: str):
    result = insects_collection.delete_one({"_id": ObjectId(insect_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Insect not found")
    return {"message": "Insect deleted successfully"}

# --------------------------
# Authentication
# --------------------------
@app.post("/api/auth/signup")
def signup(auth: AuthModel):
    if admins_collection.find_one({"email": auth.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    name = auth.name.strip() if auth.name else "Admin"
    doc = {
        "name": name,
        "email": auth.email,
        "role": "Admin",
        "isActive": True,
        "password": hash_password(auth.password)
    }
    result = admins_collection.insert_one(doc)
    return {"token": str(result.inserted_id), "name": name, "email": auth.email, "message": "Signup successful"}

@app.post("/api/auth/login")
def login(auth: AuthModel):
    user = admins_collection.find_one({"email": auth.email})
    if not user or user.get("password") != hash_password(auth.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user.get("role", "Admin")}

# --------------------------
# Chat API (Admin <-> User)
# --------------------------
# Get list of unique users who have chatted
@app.get("/api/chat/users")
def get_chat_users():
    users = chat_collection.distinct("username")
    return users

# Get chat history for a specific user
@app.get("/api/chat/{username}", response_model=List[ChatMessage])
def get_user_chat(username: str):
    return [chat_helper(c) for c in chat_collection.find({"username": username}).sort("timestamp", 1)]

# Send a message (from User or Admin)
@app.post("/api/chat", response_model=ChatMessage)
def send_chat_message(payload: ChatMessageCreate):
    doc = {
        "username": payload.username,
        "sender": payload.sender,  # 'user' or 'admin'
        "content": payload.content,
        "timestamp": datetime.utcnow(),
        "read": False  # NEW: Default to unread
    }
    result = chat_collection.insert_one(doc)
    return chat_helper(chat_collection.find_one({"_id": result.inserted_id}))

# NEW: Mark a message as read
@app.put("/api/chat/{message_id}/read")
def mark_message_as_read(message_id: str):
    try:
        result = chat_collection.update_one(
            {"_id": ObjectId(message_id)},
            {"$set": {"read": True}}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        
        updated_message = chat_collection.find_one({"_id": ObjectId(message_id)})
        return chat_helper(updated_message)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message ID: {str(e)}")

# NEW: Mark all messages from a user as read
@app.put("/api/chat/{username}/read-all")
def mark_all_messages_as_read(username: str):
    result = chat_collection.update_many(
        {
            "username": username, 
            "sender": "user", 
            "read": {"$ne": True}  # Match False OR missing field
        },
        {"$set": {"read": True}}
    )
    return {"message": f"Marked {result.modified_count} messages as read"}

# NEW: Delete a specific message
@app.delete("/api/chat/message/{message_id}")
def delete_message(message_id: str):
    try:
        result = chat_collection.delete_one({"_id": ObjectId(message_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"message": "Message deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message ID: {str(e)}")

# NEW: Delete multiple messages
@app.post("/api/chat/delete-multiple")
def delete_multiple_messages(message_ids: List[str]):
    try:
        object_ids = [ObjectId(msg_id) for msg_id in message_ids]
        result = chat_collection.delete_many({"_id": {"$in": object_ids}})
        return {"message": f"Deleted {result.deleted_count} messages"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message IDs: {str(e)}")

# --------------------------
# Image Upload / Retrieval
# --------------------------
@app.post("/api/insects/upload_image/{insect_id}")
async def upload_insect_image(insect_id: str, file: UploadFile = File(...)):
    contents = await file.read()
    file_id = fs.put(contents, filename=file.filename, content_type=file.content_type)
    if insect_id != "new":
        insect = insects_collection.find_one({"_id": ObjectId(insect_id)})
        if insect:
            images = insect.get("images", [])
            images.append(str(file_id))
            insects_collection.update_one({"_id": ObjectId(insect_id)}, {"$set": {"images": images}})
    return {"file_id": str(file_id), "filename": file.filename}

@app.get("/api/insects/image/{file_id}")
def get_insect_image(file_id: str):
    try:
        file_obj = fs.get(ObjectId(file_id))
        return StreamingResponse(io.BytesIO(file_obj.read()), media_type=file_obj.content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")
