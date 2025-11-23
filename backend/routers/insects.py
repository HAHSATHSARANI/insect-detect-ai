from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List
from bson import ObjectId
import io
from database import insects_collection, fs
from schemas import Insect
from utils import insect_helper

router = APIRouter(
    prefix="/api/insects",
    tags=["Insects"]
)

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
