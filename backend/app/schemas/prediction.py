from pydantic import BaseModel
from typing import List, Optional

class PredictionRequest(BaseModel):
    distance: float
    hour: int
    day_of_week: int
    traffic_level: str
    weather: str

class PredictionResponse(BaseModel):
    predicted_travel_time: float

class TrainingMetrics(BaseModel):
    mae: float
    rmse: float
    r2: float
    model_name: str
    training_time: float = 0.0

class MultiModelTrainingResponse(BaseModel):
    models: List[TrainingMetrics]
    best_model: str
