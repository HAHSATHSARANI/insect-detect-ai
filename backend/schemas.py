from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --------------------------
# Pydantic Models
# --------------------------
class AdminBase(BaseModel):
    name: str
    email: EmailStr
    role: str = "Admin"
    isActive: bool = True
    imageUrl: Optional[str] = None


class AdminCreate(AdminBase):
    password: str


class AdminUpdate(AdminBase):
    password: Optional[str] = None


class Admin(AdminBase):
    id: str


class Insect(BaseModel):
    id: Optional[str] = None
    name: str
    scientificName: str
    description: str
    image: Optional[str] = None
    images: Optional[List[str]] = []
    category: str
    confidence: float = 95


class AuthModel(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


# Mobile App User Models
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    district: Optional[str] = None
    landSize: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# Chat Models
class ChatMessage(BaseModel):
    id: Optional[str] = None
    username: str  # The user this chat belongs to
    sender: str  # 'user' or 'admin'
    content: str
    timestamp: Optional[datetime] = None
    read: bool = False  # NEW: Track read status


class ChatMessageCreate(BaseModel):
    username: str
    content: str
    sender: str = "user"  # Default to user for the test page
