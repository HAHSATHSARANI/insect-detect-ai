from fastapi import APIRouter, HTTPException
from database import admins_collection
from schemas import AuthModel
from utils import hash_password

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

@router.post("/signup")
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


@router.post("/login")
def login(auth: AuthModel):
    user = admins_collection.find_one({"email": auth.email})
    if not user or user.get("password") != hash_password(auth.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return {"token": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user.get("role", "Admin")}
