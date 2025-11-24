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
        "name": doc["name"],
        "scientificName": doc["scientificName"],
        "description": doc["description"],
        "image": doc.get("image", ""),
        "images": doc.get("images", []),
        "category": doc["category"],
        "confidence": doc.get("confidence", 95)
    }


def chat_helper(doc) -> dict:
    return {
        "id": str(doc["_id"]),
        "username": doc["username"],
        "sender": doc["sender"],
        "content": doc["content"],
        "timestamp": doc.get("timestamp", datetime.utcnow()),
        "read": doc.get("read", False)  # NEW: Include read status
    }
