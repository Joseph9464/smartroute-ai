from fastapi import APIRouter
from app.schemas.prediction import PredictionRequest, PredictionResponse, MultiModelTrainingResponse
from app.services.ml_service import train_model, predict_travel_time

router = APIRouter()

@router.post("/train", response_model=MultiModelTrainingResponse)
def train():
    metrics = train_model()
    return metrics

@router.post("/predict", response_model=PredictionResponse)
def predict(req: PredictionRequest):
    time = predict_travel_time(req)
    return PredictionResponse(predicted_travel_time=time)
