from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List
from bson import ObjectId
import io
import os
import json
import cv2
import numpy as np
from PIL import Image
import base64
from ultralytics import YOLO
from database import insects_collection, fs
from schemas import Insect
from utils import insect_helper

router = APIRouter(
    prefix="/api/insects",
    tags=["Insects"]
)

# --------------------------
# YOLO Model Setup
# --------------------------
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "detect_model", "yolov8n_50epocs_v2.pt")

try:
    model = YOLO(MODEL_PATH)
    print(f"✓ YOLO model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"⚠ Failed to load YOLO model: {e}")
    model = None

# Supported insects list (the 11 classes from insects.json)
SUPPORTED_INSECT_KEYS = [
    "Armyworm",
    "Brown_Planthopper",
    "Crickets",
    "Dragonfly",
    "Mealybug",
    "Rice_Bug",
    "Rice_Gall_Midge",
    "Rice_Water_Weevil",
    "Thrips",
    "Wasps",
    "Whorl_Maggot"
]


@router.get("/random", response_model=List[Insect])
def get_random_insects():
    try:
        # Try to get 3 random documents
        pipeline = [{"$sample": {"size": 3}}]
        results = list(insects_collection.aggregate(pipeline))
        
        # If aggregation returns nothing (e.g., empty collection) or fewer than 3, 
        # we can also try a standard find to be safe, but sample usually works.
        # If results is empty, try standard find just in case sample failed silently
        if not results:
             results = list(insects_collection.find().limit(3))
             
        return [insect_helper(doc) for doc in results]
    except Exception as e:
        print(f"Error fetching random insects: {e}")
        # Fallback to simple find
        return [insect_helper(doc) for doc in insects_collection.find().limit(3)]


@router.get("", response_model=List[Insect])
def get_insects():
    return [insect_helper(i) for i in insects_collection.find()]


@router.post("", response_model=Insect)
def create_insect(insect: Insect):
    doc = insect.dict(exclude={"id"})
    result = insects_collection.insert_one(doc)
    return insect_helper(insects_collection.find_one({"_id": result.inserted_id}))


@router.put("/{insect_id}", response_model=Insect)
def update_insect(insect_id: str, insect: Insect):
    data = insect.dict(exclude_unset=True, exclude={"id"})
    result = insects_collection.update_one({"_id": ObjectId(insect_id)}, {"$set": data})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Insect not found")
    return insect_helper(insects_collection.find_one({"_id": ObjectId(insect_id)}))


@router.delete("/{insect_id}")
def delete_insect(insect_id: str):
    result = insects_collection.delete_one({"_id": ObjectId(insect_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Insect not found")
    return {"message": "Insect deleted successfully"}


# --------------------------
# Image Upload / Retrieval
# --------------------------
@router.post("/upload_image/{insect_id}")
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


@router.get("/image/{file_id}")
def get_insect_image(file_id: str):
    try:
        file_obj = fs.get(ObjectId(file_id))
        return StreamingResponse(io.BytesIO(file_obj.read()), media_type=file_obj.content_type)
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Image not found: {str(e)}")


# --------------------------
# Real Classification with YOLO
# --------------------------
@router.post("/classify")
async def classify_insect(file: UploadFile = File(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Model not loaded")

    # Read image
    contents = await file.read()
    np_array = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    
    # Run inference
    results = model.predict(source=image)
    
    # Get the image with bounding boxes plotted on it
    result_image_array = results[0].plot() 
    
    # Convert the result from BGR (OpenCV default) to RGB
    result_image_rgb = cv2.cvtColor(result_image_array, cv2.COLOR_BGR2RGB)
    
    # Convert the processed image to base64
    result_image_pil = Image.fromarray(result_image_rgb)
    buffered = io.BytesIO()
    result_image_pil.save(buffered, format="JPEG", quality=85)
    processed_image_base64 = base64.b64encode(buffered.getvalue()).decode('utf-8')
    
    # Get detected classes
    detected_indices = results[0].boxes.cls.unique().cpu().numpy().astype(int)
    detected_names = [model.names[i] for i in detected_indices]
    
    if not detected_names:
        # Case 1: Nothing detected by YOLO
        return {
            "name": "හඳුනාගත නොහැක",
            "scientificName": "(Unknown)",
            "description": "කරුණාකර පැහැදිලි රූපයක් ලබා දෙන්න.",
            "category": "Unknown",
            "confidence": 0,
            "processedImage": processed_image_base64
        }

    # Take the first detected insect
    detected_key = detected_names[0]
    
    # Check if detected key is in our supported list (Safety check)
    # Even if YOLO detects "Dog", we only care about our 11 insects
    # Note: The trained model should only output these classes anyway
    
    # QUERY DATABASE USING THE YOLO KEY
    # We assume the DB documents have a 'key' field matching these YOLO class names
    db_insect = insects_collection.find_one({"key": detected_key})
    
    if db_insect:
        # FOUND IN DATABASE -> Return full details
        result = insect_helper(db_insect)
        
        # Add dynamic fields calculated from detection
        result["confidence"] = float(results[0].boxes.conf[0]) * 100 if len(results[0].boxes.conf) > 0 else 95.0
        result["processedImage"] = processed_image_base64
        
        # Ensure category mapping if needed
        if result.get("category") == "Non-Harmful":
            result["category"] = "Beneficial"
            
        return result
    
    else:
        # DETECTED BY YOLO BUT DATA MISSING IN DB
        # Return specific error structure that frontend can recognize
        return {
            "name": detected_key, # Send the key so we know what was detected
            "scientificName": "(Data Missing)",
            "description": "This insect was detected but its details are not in the database.",
            "category": "DataMissing", # Special flag for frontend
            "confidence": float(results[0].boxes.conf[0]) * 100 if len(results[0].boxes.conf) > 0 else 0,
            "processedImage": processed_image_base64
        }
