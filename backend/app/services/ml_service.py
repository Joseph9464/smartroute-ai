import os
import pandas as pd
import joblib
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from app.schemas.prediction import PredictionRequest, TrainingMetrics, MultiModelTrainingResponse
import time

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "models")
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")
MODEL_PATH = os.path.join(MODEL_DIR, "best_model.joblib")

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
    data_path = os.path.join(DATA_DIR, "synthetic_data.csv")
    if not os.path.exists(data_path):
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
            
    os.makedirs(MODEL_DIR, exist_ok=True)
    joblib.dump(best_model, MODEL_PATH)
    _cached_model = best_model  # Update cache immediately
    
    return MultiModelTrainingResponse(models=results, best_model=best_model_name)

_cached_model = None

def get_model():
    global _cached_model
    if _cached_model is None:
        if not os.path.exists(MODEL_PATH):
            # Fallback to old path if exists for backward compatibility
            old_path = os.path.join(MODEL_DIR, "trained_model.joblib")
            if os.path.exists(old_path):
                _cached_model = joblib.load(old_path)
            else:
                raise FileNotFoundError("Model not trained yet.")
        else:
            _cached_model = joblib.load(MODEL_PATH)
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

