from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from database import admins_collection
from schemas import Admin, AdminCreate, AdminUpdate
from utils import admin_helper, hash_password

router = APIRouter(
    prefix="/api/admins",
    tags=["Admins"]
)

@router.get("", response_model=List[Admin])
def get_admins():
    return [admin_helper(a) for a in admins_collection.find()]


@router.post("", response_model=Admin)
def create_admin(admin: AdminCreate):
    if admins_collection.find_one({"email": admin.email}):
        raise HTTPException(status_code=400, detail="Email already exists")
    doc = admin.dict()
    doc["password"] = hash_password(doc["password"])
    result = admins_collection.insert_one(doc)
    return admin_helper(admins_collection.find_one({"_id": result.inserted_id}))


@router.put("/{admin_id}", response_model=Admin)
def update_admin(admin_id: str, admin: AdminUpdate):
    data = admin.dict(exclude_unset=True)
    if "password" in data and data["password"]:
        data["password"] = hash_password(data["password"])
    result = admins_collection.update_one({"_id": ObjectId(admin_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return admin_helper(admins_collection.find_one({"_id": ObjectId(admin_id)}))


@router.delete("/{admin_id}")
def delete_admin(admin_id: str):
    result = admins_collection.delete_one({"_id": ObjectId(admin_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Admin not found")
    return {"message": "Admin deleted successfully"}
