from fastapi import APIRouter, HTTPException
from database import users_collection
from schemas import UserCreate, UserLogin
from utils import hash_password, user_helper

router = APIRouter(
    prefix="/api/app/auth",
    tags=["App Authentication"]
)

@router.post("/signup")
def signup(user: UserCreate):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    
    doc = {
        "name": user.name,
        "email": user.email,
        "password": hash_password(user.password),
        "district": user.district,
        "landSize": user.landSize,
        "role": "User",
        "createdAt": datetime.utcnow()
    }
    
    result = users_collection.insert_one(doc)
    created_user = users_collection.find_one({"_id": result.inserted_id})
    
    return {
        "message": "Signup successful",
        "token": str(result.inserted_id),
        "user": user_helper(created_user)
    }


@router.post("/login")
def login(user: UserLogin):
    existing_user = users_collection.find_one({"email": user.email})
    
    if not existing_user or existing_user.get("password") != hash_password(user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "token": str(existing_user["_id"]),
        "user": user_helper(existing_user)
    }

from datetime import datetime

