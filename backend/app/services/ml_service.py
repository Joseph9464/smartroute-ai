import os
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.schemas.prediction import PredictionRequest, TrainingMetrics, MultiModelTrainingResponse
import time

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
IS_VERCEL = os.environ.get("VERCEL") == "1"

MODEL_DIR = Path("/tmp/models") if IS_VERCEL else BASE_DIR / "models"
DATA_DIR = Path("/tmp/data") if IS_VERCEL else BASE_DIR / "data"

MODEL_PATH = MODEL_DIR / "best_model.joblib"
FALLBACK_MODEL_PATH = BASE_DIR / "models" / "best_model.joblib"
OLD_FALLBACK_MODEL_PATH = BASE_DIR / "models" / "trained_model.joblib"
TRAFFIC_MAP = {"Low": 0, "Medium": 1, "High": 2}
WEATHER_MAP = {"Sunny": 0, "Cloudy": 1, "Rainy": 2}

def prepare_features(df: pd.DataFrame):
    df = df.copy()
    if 'traffic_level' in df.columns:
        df['traffic_level'] = df['traffic_level'].map(TRAFFIC_MAP)
    if 'weather' in df.columns:
        df['weather'] = df['weather'].map(WEATHER_MAP)
    return df

def train_model() -> MultiModelTrainingResponse:
    global _cached_model
    data_path = DATA_DIR / "synthetic_data.csv"
    
    if not data_path.exists():
        fallback = BASE_DIR / "data" / "synthetic_data.csv"
        if fallback.exists():
            data_path = fallback
        else:
            raise FileNotFoundError("Data file not found. Generate synthetic data first.")
        
    df = pd.read_csv(data_path)
    df = prepare_features(df)
    
    X = df[['distance', 'hour', 'day_of_week', 'traffic_level', 'weather']]
    y = df['historical_travel_time']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    models_to_train = {
        "Linear Regression": LinearRegression(),
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "Gradient Boosting": GradientBoostingRegressor(n_estimators=100, random_state=42)
    }
    
    results = []
    best_rmse = float('inf')
    best_model_name = ""
    best_model = None
    
    for name, model in models_to_train.items():
        start = time.time()
        model.fit(X_train, y_train)
        train_time = time.time() - start
        
        preds = model.predict(X_test)
        mae = mean_absolute_error(y_test, preds)
        rmse = mean_squared_error(y_test, preds, squared=False)
        r2 = r2_score(y_test, preds)
        
        results.append(TrainingMetrics(
            model_name=name,
            mae=mae,
            rmse=rmse,
            r2=r2,
            training_time=train_time
        ))
        
        if rmse < best_rmse:
            best_rmse = rmse
            best_model_name = name
            best_model = model
            
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(best_model, str(MODEL_PATH))
    _cached_model = best_model  # Update cache immediately
    
    return MultiModelTrainingResponse(models=results, best_model=best_model_name)

_cached_model = None

def get_model():
    global _cached_model
    if _cached_model is None:
        if MODEL_PATH.exists():
            _cached_model = joblib.load(str(MODEL_PATH))
        elif FALLBACK_MODEL_PATH.exists():
            _cached_model = joblib.load(str(FALLBACK_MODEL_PATH))
        elif OLD_FALLBACK_MODEL_PATH.exists():
            _cached_model = joblib.load(str(OLD_FALLBACK_MODEL_PATH))
        else:
            raise FileNotFoundError("Model not trained yet.")
    return _cached_model

def predict_travel_time(req: PredictionRequest) -> float:
    model = get_model()
    
    df = pd.DataFrame([{
        "distance": req.distance,
        "hour": req.hour,
        "day_of_week": req.day_of_week,
        "traffic_level": req.traffic_level,
        "weather": req.weather
    }])
    
    df = prepare_features(df)
    pred = model.predict(df)[0]
    
    return float(pred)

def predict_travel_times_bulk(reqs: list[PredictionRequest]) -> list[float]:
    if not reqs:
        return []
    
    model = get_model()
    df = pd.DataFrame([
        {
            "distance": r.distance,
            "hour": r.hour,
            "day_of_week": r.day_of_week,
            "traffic_level": r.traffic_level,
            "weather": r.weather
        } for r in reqs
    ])
    
    df = prepare_features(df)
    preds = model.predict(df)
    
    return [float(p) for p in preds]

