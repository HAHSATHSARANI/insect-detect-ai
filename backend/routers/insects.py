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
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "detect_model", "best.pt")
INSECT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "detect_model", "insects.json")

try:
    model = YOLO(MODEL_PATH)
    print(f"✓ YOLO model loaded from {MODEL_PATH}")
except Exception as e:
    print(f"⚠ Failed to load YOLO model: {e}")
    model = None

# Load insect data map
try:
    with open(INSECT_DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)
        insect_data_map = {item['key']: item for item in data['insects']}
    print(f"✓ Insect data loaded from {INSECT_DATA_PATH}")
except Exception as e:
    print(f"⚠ Failed to load insect data: {e}")
    insect_data_map = {}


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
    
    # Get detected classes
    detected_indices = results[0].boxes.cls.unique().cpu().numpy().astype(int)
    detected_names = [model.names[i] for i in detected_indices]
    
    if not detected_names:
        # Fallback if nothing detected or return specific response
        # For now, returning a 'not found' like structure or the first insect in DB as fallback if strictly needed
        # But correctly we should inform the user.
        # Let's return a generic "Unknown" response to handle gracefully in frontend
        return {
            "name": "හඳුනාගත නොහැක",
            "scientificName": "(Unknown)",
            "description": "කරුණාකර පැහැදිලි රූපයක් ලබා දෙන්න.",
            "category": "Unknown",
            "confidence": 0
        }

    # Take the first detected insect (highest confidence usually first if sorted, or just pick first)
    # In a real scenario, we might handle multiple detections. Here we pick the primary one.
    primary_insect_key = detected_names[0]
    insect_info = insect_data_map.get(primary_insect_key)
    
    if not insect_info:
         return {
            "name": primary_insect_key,
            "scientificName": "(Unknown Data)",
            "description": "Data not found for this insect key.",
            "category": "Unknown",
            "confidence": 0
        }

    # Map JSON data to our Schema format
    # Note: The JSON file has different keys (english_name, sinhala_name, status, reduce_method)
    # We need to adapt them to our frontend expected structure (name, description, category, etc.)
    
    # Construct control methods text from reduce_method list
    control_methods_text = "\n".join([f"- {method}" for method in insect_info.get('reduce_method', [])])

    # Determine category (Harmful/Beneficial)
    # JSON uses 'Harmful' / 'Non-Harmful'. Map Non-Harmful -> Beneficial
    category = "Beneficial" if insect_info.get('status') == 'Non-Harmful' else "Harmful"

    result = {
        "name": insect_info.get('sinhala_name', insect_info.get('english_name')),
        "scientificName": f"({insect_info.get('english_name')})",
        "scientificNameFull": insect_info.get('key'), # Using key as placeholder or if we had full name
        "family": "", # Not in JSON, leave empty
        "description": insect_info.get('description'),
        "category": category,
        "confidence": float(results[0].boxes.conf[0]) * 100 if len(results[0].boxes.conf) > 0 else 90.0,
        
        # Map detailed fields
        "lifeCycleTitle": "ජීවන චක්‍රය",
        "lifeCycleContent": "තොරතුරු ඇතුළත් කර නොමැත.", # Default as JSON doesn't have this specific field
        
        "damageSymptomsTitle": "හානි ලක්ෂණ",
        "damageSymptomsContent": insect_info.get('description'), # Re-using description as it often contains damage info
        
        "controlMethodsTitle": "පාලන ක්‍රම",
        "controlMethodsContent": control_methods_text,
        
        # Structured fields (can be parsed from text if needed, or left empty for general view)
        "resistantVarieties": "",
        "pesticideInstructions": "",
        "ecoFriendlySolutions": "",
        "chemicalControlTable": [],
        "additionalNotes": ""
    }
    
    return result
