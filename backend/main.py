from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import auth, auth_users, admins, insects, chats, general, collections

app = FastAPI(title="Farmer Admin API")

origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(auth_users.router)
app.include_router(admins.router)
app.include_router(insects.router)
app.include_router(collections.router)
app.include_router(chats.router)
app.include_router(general.router)
