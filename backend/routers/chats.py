from fastapi import APIRouter, HTTPException
from typing import List
from bson import ObjectId
from datetime import datetime
from database import chat_collection, conversations_collection
from schemas import ChatMessage, ChatMessageCreate, Conversation, ConversationCreate
from utils import chat_helper, conversation_helper

router = APIRouter(
    prefix="/api/chat",
    tags=["Chat"]
)

# Get all conversations for a user
@router.get("/conversations/{user_id}", response_model=List[Conversation])
def get_user_conversations(user_id: str):
    conversations = conversations_collection.find({"userId": user_id}).sort("updatedAt", -1)
    return [conversation_helper(c) for c in conversations]

# Create a new conversation
@router.post("/conversations", response_model=Conversation)
def create_conversation(conversation: ConversationCreate):
    doc = {
        "userId": conversation.userId,
        "title": conversation.title,
        "lastMessage": conversation.initialMessage,
        "lastMessageTime": datetime.utcnow(),
        "unreadCount": 0,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = conversations_collection.insert_one(doc)
    conversation_id = str(result.inserted_id)
    
    # Add the initial message
    message_doc = {
        "conversationId": conversation_id,
        "userId": conversation.userId,
        "sender": "user",
        "content": conversation.initialMessage,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    chat_collection.insert_one(message_doc)
    
    created_conversation = conversations_collection.find_one({"_id": result.inserted_id})
    return conversation_helper(created_conversation)

# Get messages for a specific conversation
@router.get("/conversations/{conversation_id}/messages", response_model=List[ChatMessage])
def get_conversation_messages(conversation_id: str):
    messages = chat_collection.find({"conversationId": conversation_id}).sort("timestamp", 1)
    return [chat_helper(m) for m in messages]

# Send a message in a conversation
@router.post("/conversations/{conversation_id}/messages", response_model=ChatMessage)
def send_message(conversation_id: str, message: ChatMessageCreate):
    # Verify conversation exists
    conversation = conversations_collection.find_one({"_id": ObjectId(conversation_id)})
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    doc = {
        "conversationId": conversation_id,
        "userId": message.userId,
        "sender": message.sender,
        "content": message.content,
        "timestamp": datetime.utcnow(),
        "read": False
    }
    
    result = chat_collection.insert_one(doc)
    
    # Update conversation with last message info
    update_data = {
        "lastMessage": message.content,
        "lastMessageTime": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    # If message is from admin, increment unread count for user
    if message.sender == "admin":
        conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {
                "$set": update_data,
                "$inc": {"unreadCount": 1}
            }
        )
    else:
        conversations_collection.update_one(
            {"_id": ObjectId(conversation_id)},
            {"$set": update_data}
        )
    
    return chat_helper(chat_collection.find_one({"_id": result.inserted_id}))

# Mark conversation as read (reset unread count)
@router.put("/conversations/{conversation_id}/read")
def mark_conversation_as_read(conversation_id: str):
    conversations_collection.update_one(
        {"_id": ObjectId(conversation_id)},
        {"$set": {"unreadCount": 0}}
    )
    return {"message": "Conversation marked as read"}

# Delete a conversation
@router.delete("/conversations/{conversation_id}")
def delete_conversation(conversation_id: str):
    # Delete all messages in the conversation
    chat_collection.delete_many({"conversationId": conversation_id})
    
    # Delete the conversation
    result = conversations_collection.delete_one({"_id": ObjectId(conversation_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    return {"message": "Conversation deleted successfully"}

# Legacy endpoints for backward compatibility
@router.get("/users")
def get_chat_users():
    users = chat_collection.distinct("userId")
    return users

@router.get("/{username}", response_model=List[ChatMessage])
def get_user_chat(username: str):
    return [chat_helper(c) for c in chat_collection.find({"userId": username}).sort("timestamp", 1)]
