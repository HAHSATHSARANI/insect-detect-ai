import hashlib
from datetime import datetime

# --------------------------
# Helper Functions
# --------------------------
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


def admin_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "role": doc.get("role", "Admin"),
        "isActive": doc.get("isActive", True),
        "imageUrl": doc.get("imageUrl", "")
    }


def user_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "name": doc["name"],
        "email": doc["email"],
        "district": doc.get("district", ""),
        "landSize": doc.get("landSize", ""),
        "imageUrl": doc.get("imageUrl", ""),
        "role": "User"
    }


def insect_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "key": doc.get("key"),
        "name": doc["name"],
        "scientificName": doc["scientificName"],
        "scientificNameFull": doc.get("scientificNameFull"),
        "family": doc.get("family"),
        "description": doc["description"],
        "image": doc.get("image", ""),
        "images": doc.get("images", []),
        "category": doc["category"],
        "confidence": doc.get("confidence", 95),
        
        # Detailed fields
        "lifeCycleTitle": doc.get("lifeCycleTitle", "ජීවන චක්‍රය"),
        "lifeCycleContent": doc.get("lifeCycleContent"),
        
        "damageSymptomsTitle": doc.get("damageSymptomsTitle", "හානි ලක්ෂණ"),
        "damageSymptomsContent": doc.get("damageSymptomsContent"),
        
        "controlMethodsTitle": doc.get("controlMethodsTitle", "පාලන ක්‍රම"),
        "controlMethodsContent": doc.get("controlMethodsContent"),
        
        # Control details
        "resistantVarieties": doc.get("resistantVarieties"),
        "pesticideInstructions": doc.get("pesticideInstructions"),
        "ecoFriendlySolutions": doc.get("ecoFriendlySolutions"),
        
        # Chemical control
        "chemicalControlTable": doc.get("chemicalControlTable"),
        
        # Additional notes
        "additionalNotes": doc.get("additionalNotes")
    }


def chat_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "conversationId": doc.get("conversationId", ""),
        "userId": doc.get("userId", doc.get("username", "")),  # Support both old and new format
        "sender": doc["sender"],
        "content": doc["content"],
        "timestamp": doc.get("timestamp", datetime.utcnow()),
        "read": doc.get("read", False)
    }


def conversation_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "userId": doc["userId"],
        "title": doc["title"],
        "lastMessage": doc.get("lastMessage", ""),
        "lastMessageTime": doc.get("lastMessageTime"),
        "unreadCount": doc.get("unreadCount", 0),
        "createdAt": doc.get("createdAt"),
        "updatedAt": doc.get("updatedAt")
    }
