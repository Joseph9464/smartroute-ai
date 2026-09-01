from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import datasets, prediction, optimization

app = FastAPI(
    title="SmartRoute AI",
    description="API for Delivery Route Optimization using ML and VRP",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(datasets.router, prefix="/api/datasets", tags=["Datasets"])
app.include_router(prediction.router, prefix="/api/ml", tags=["Machine Learning"])
app.include_router(optimization.router, prefix="/api/optimization", tags=["Optimization"])

@app.get("/")
def read_root():
    return {"message": "Welcome to SmartRoute AI API"}
