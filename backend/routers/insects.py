from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import List
from bson import ObjectId
import io
import random
import time
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


# --------------------------
# Classification (Mock)
# --------------------------
@router.post("/classify")
async def classify_insect(file: UploadFile = File(...)):
    # Simulate processing time
    time.sleep(1.5)
    
    # Mock response data
    # In a real app, this would call an ML model
    mock_results = [
        {
            "name": "දුඹුරු පැළ කීඩෑවා",
            "scientificName": "(Brown PlantBopper)",
            "scientificNameFull": "Nilaparvata lugens",
            "family": "Delphacidae",
            "description": "දුඹුරු පැළ කීඩෑවා (BPH) යනු වී වගාවට බරපතල හානි සිදු කරන කෘමියෙකි. මොවුන් ශාකයේ යුෂ උරා බොන අතර වෛරස් රෝග පැතිරවිය හැක.",
            "category": "Harmful",
            "confidence": 96.5,
            "lifeCycleTitle": "ජීවන චක්‍රය",
            "lifeCycleContent": "බිත්තර දින 7-9 කින් පිපිරේ. පැටවුන් දින 13-15 කින් වැඩෙයි.",
            "damageSymptomsTitle": "හානි ලක්ෂණ",
            "damageSymptomsContent": "පැළ කහ වීම සහ 'හොපර් පිළිස්සීම' ලෙස හැඳින්වෙන වියළී යාම.",
            "controlMethodsTitle": "පාලන ක්‍රම",
            "controlMethodsContent": "ප්‍රතිරෝධී වී ප්‍රභේද භාවිතය, ස්වභාවික සතුරන් රැකගැනීම (මකුළුවන්)."
        },
        {
            "name": "ලේඩි බග් මකුණා",
            "scientificName": "(Ladybird Beetle)",
            "scientificNameFull": "Coccinellidae",
            "family": "Coccinellidae",
            "description": "ලේඩි බග් මකුණා ගොවියාට හිතකර කෘමියෙකි. මොවුන් හානිකර කෘමීන් (කුඩිත්තන් වැනි) ආහාරයට ගනී.",
            "category": "Beneficial",
            "confidence": 98.2,
            "lifeCycleTitle": "ජීවන චක්‍රය",
            "lifeCycleContent": "බිත්තර, කීටයා, පිලාවා සහ වැඩුණු සතා ලෙස අවධි හතරකි.",
            "damageSymptomsTitle": "ප්‍රතිලාභ",
            "damageSymptomsContent": "කුඩිත්තන්, පිටි මකුණන් වැනි හානිකර කෘමීන් පාලනය කරයි.",
            "controlMethodsTitle": "සංරක්ෂණය",
            "controlMethodsContent": "රසායනික කෘමිනාශක භාවිතය අවම කිරීම මගින් මොවුන් ආරක්ෂා කරගත හැක."
        }
    ]
    
    # Randomly select one for demo purposes
    result = random.choice(mock_results)
    return result
