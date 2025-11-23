from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime
from database import chat_collection
from schemas import ChatMessage, ChatMessageCreate
from utils import chat_helper

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"]
)

# Get list of unique users who have chatted
@router.get("/users")
def get_chat_users():
    users = chat_collection.distinct("username")
    return users


# Get chat history for a specific user
@router.get("/{username}", response_model=List[ChatMessage])
def get_user_chat(username: str):
    return [chat_helper(c) for c in chat_collection.find({"username": username}).sort("timestamp", 1)]


# Send a message (from User or Admin)
@router.post("", response_model=ChatMessage)
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
@router.put("/{message_id}/read")
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
@router.put("/{username}/read-all")
def mark_all_messages_as_read(username: str):
    result = chat_collection.update_many(
        {"username": username, "sender": "user", "read": False},
        {"$set": {"read": True}}
    )
    return {"message": f"Marked {result.modified_count} messages as read"}


# NEW: Delete a specific message
@router.delete("/message/{message_id}")
def delete_message(message_id: str):
    try:
        result = chat_collection.delete_one({"_id": ObjectId(message_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Message not found")
        return {"message": "Message deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message ID: {str(e)}")


# NEW: Delete multiple messages
@router.post("/delete-multiple")
def delete_multiple_messages(message_ids: List[str]):
    try:
        object_ids = [ObjectId(msg_id) for msg_id in message_ids]
        result = chat_collection.delete_many({"_id": {"$in": object_ids}})
        return {"message": f"Deleted {result.deleted_count} messages"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid message IDs: {str(e)}")
