from fastapi import APIRouter, HTTPException, Body, UploadFile, File
from typing import List
from datetime import datetime
from bson import ObjectId
from database import collections_collection, fs
from schemas import Collection, CollectionCreate, CollectionItemCreate, CollectionUpdate
from utils import admin_helper

router = APIRouter(
    prefix="/api/collections",
    tags=["Collections"]
)

@router.post("/upload", response_model=dict)
async def upload_collection_image(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        file_id = fs.put(contents, filename=file.filename, content_type=file.content_type)
        return {"fileId": str(file_id), "filename": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

def collection_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "description": doc.get("description", ""),
        "date": doc.get("date"),
        "userId": doc["userId"],
        "items": doc.get("items", []),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt")
    }

@router.post("", response_model=Collection)
def create_collection(collection: CollectionCreate):
    doc = collection.dict()
    doc["createdAt"] = datetime.utcnow()
    doc["updatedAt"] = datetime.utcnow()
    doc["items"] = []
    
    result = collections_collection.insert_one(doc)
    created_collection = collections_collection.find_one({"_id": result.inserted_id})
    return collection_helper(created_collection)

@router.get("/user/{user_id}", response_model=List[Collection])
def get_user_collections(user_id: str):
    collections = collections_collection.find({"userId": user_id})
    return [collection_helper(c) for c in collections]

@router.get("/{collection_id}", response_model=Collection)
def get_collection(collection_id: str):
    collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection_helper(collection)

@router.delete("/{collection_id}")
def delete_collection(collection_id: str):
    result = collections_collection.delete_one({"_id": ObjectId(collection_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "Collection deleted successfully"}

@router.put("/{collection_id}", response_model=Collection)
def update_collection(collection_id: str, collection: CollectionUpdate):
    existing_collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    if not existing_collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    update_data = {k: v for k, v in collection.dict().items() if v is not None}
    
    if update_data:
        update_data["updatedAt"] = datetime.utcnow()
        collections_collection.update_one(
            {"_id": ObjectId(collection_id)},
            {"$set": update_data}
        )
    
    updated_collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    return collection_helper(updated_collection)

@router.post("/{collection_id}/items")
def add_item_to_collection(collection_id: str, item: CollectionItemCreate):
    collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    
    item_dict = item.dict()
    # Ensure id is string if generated or managed elsewhere, 
    # but here it's embedded so we can just append
    
    collections_collection.update_one(
        {"_id": ObjectId(collection_id)},
        {
            "$push": {"items": item_dict},
            "$set": {"updatedAt": datetime.utcnow()}
        }
    )
    
    updated_collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    return collection_helper(updated_collection)

@router.delete("/{collection_id}/items/{item_index}")
def remove_item_from_collection(collection_id: str, item_index: int):
    # MongoDB doesn't easily support removing by index in a simple atomic operator 
    # without concurrency issues if array changes, but for this scope:
    # We can unset then pull null, or read-modify-write.
    
    collection = collections_collection.find_one({"_id": ObjectId(collection_id)})
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
        
    items = collection.get("items", [])
    if item_index < 0 or item_index >= len(items):
        raise HTTPException(status_code=404, detail="Item not found")
        
    # Remove item at index
    items.pop(item_index)
    
    collections_collection.update_one(
        {"_id": ObjectId(collection_id)},
        {
            "$set": {"items": items, "updatedAt": datetime.utcnow()}
        }
    )
    
    return {"message": "Item removed successfully"}

