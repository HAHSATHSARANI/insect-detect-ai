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


# Updated Insect Model to match requirement 3
class Insect(BaseModel):
    id: Optional[str] = None
    name: str
    scientificName: str
    scientificNameFull: Optional[str] = None
    family: Optional[str] = None
    description: str
    image: Optional[str] = None
    images: Optional[List[str]] = []
    category: str
    confidence: float = 95
    
    # New detailed fields
    lifeCycleTitle: str = "ජීවන චක්‍රය"
    lifeCycleContent: Optional[str] = None
    
    damageSymptomsTitle: str = "හානි ලක්ෂණ"
    damageSymptomsContent: Optional[str] = None
    
    controlMethodsTitle: str = "පාලන ක්‍රම"
    controlMethodsContent: Optional[str] = None
    
    # Pesticide / Control details
    resistantVarieties: Optional[str] = None  # ප්‍රතිරෝධී වී ප්‍රභේද
    pesticideInstructions: Optional[str] = None  # කෘමිනාශක
    ecoFriendlySolutions: Optional[str] = None  # පරිසර හිතකාමී විසඳුම්
    
    # Chemical control specifics
    chemicalControlTable: Optional[List[dict]] = None # e.g., [{name, concentration, amount}]
    
    additionalNotes: Optional[str] = None # වෙනත් කරුණු


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


class UserUpdate(BaseModel):
    name: Optional[str] = None
    district: Optional[str] = None
    landSize: Optional[str] = None


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


# --------------------------
# Collection Models
# --------------------------
class CollectionItemBase(BaseModel):
    insectName: str
    scientificName: str
    imageUrl: Optional[str] = None
    confidence: float = 0
    category: str
    dateAdded: datetime = datetime.utcnow()
    
    # Store enough info to display in list or navigate to details
    insectData: Optional[dict] = None # Snapshot of the insect details at time of capture


class CollectionItemCreate(CollectionItemBase):
    pass


class CollectionBase(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    userId: str # The user who owns this collection


class CollectionCreate(BaseModel):
    name: str
    description: Optional[str] = None
    date: Optional[datetime] = None
    userId: str


class CollectionUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None



class Collection(CollectionBase):
    id: str
    items: List[CollectionItemBase] = []
    createdAt: datetime
    updatedAt: datetime
