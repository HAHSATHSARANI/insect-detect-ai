from fastapi import APIRouter, HTTPException, UploadFile, File, Body
from database import users_collection, fs
from schemas import UserCreate, UserLogin, UserUpdate
from utils import hash_password, user_helper
from bson import ObjectId
from datetime import datetime
import io
from fastapi.responses import StreamingResponse

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

@router.get("/user/{user_id}")
def get_user(user_id: str):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_helper(user)

@router.get("/users")
def get_all_users():
    users = users_collection.find({"role": "User"})
    return [user_helper(user) for user in users]

@router.put("/user/{user_id}")
def update_user(user_id: str, user_update: UserUpdate):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if update_data:
        users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
        
    updated_user = users_collection.find_one({"_id": ObjectId(user_id)})
    return user_helper(updated_user)

@router.post("/user/{user_id}/image")
async def upload_profile_image(user_id: str, file: UploadFile = File(...)):
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    contents = await file.read()
    file_id = fs.put(contents, filename=file.filename, content_type=file.content_type)
    
    users_collection.update_one({"_id": ObjectId(user_id)}, {"$set": {"imageUrl": str(file_id)}})
    
    return {"fileId": str(file_id), "filename": file.filename}

@router.get("/image/{file_id}")
def get_profile_image(file_id: str):
    try:
        file_obj = fs.get(ObjectId(file_id))
        return StreamingResponse(io.BytesIO(file_obj.read()), media_type=file_obj.content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")


