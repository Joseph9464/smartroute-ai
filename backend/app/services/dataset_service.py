import pandas as pd
import numpy as np
import random
import os

# Manhattan bounding box approximately
MIN_LAT, MAX_LAT = 40.70, 40.85
MIN_LON, MAX_LON = -74.02, -73.93

TRAFFIC_FACTORS = {"Low": 1.0, "Medium": 1.3, "High": 1.8}
WEATHER_FACTORS = {"Sunny": 1.0, "Cloudy": 1.1, "Rainy": 1.3}

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data")

def generate_synthetic_data(num_customers: int = 50, filename: str = "synthetic_data.csv") -> pd.DataFrame:
    """Generate synthetic dataset for customers and historical deliveries."""
    
    # Depot is always customer_id 0
    customers = []
    
    for i in range(num_customers + 1):
        lat = random.uniform(MIN_LAT, MAX_LAT)
        lon = random.uniform(MIN_LON, MAX_LON)
        demand = 0 if i == 0 else random.randint(1, 20)
        
        customers.append({
            "customer_id": i,
            "latitude": lat,
            "longitude": lon,
            "demand": demand,
        })
        
    df_customers = pd.DataFrame(customers)
    
    # Generate historical deliveries for ML training
    deliveries = []
    for _ in range(num_customers * 10):  # 10 records per customer for training
        c1 = random.choice(customers)
        c2 = random.choice(customers)
        if c1['customer_id'] == c2['customer_id']:
            continue
            
        # Euclidean distance scaled roughly to km
        distance_km = np.sqrt((c1['latitude'] - c2['latitude'])**2 + (c1['longitude'] - c2['longitude'])**2) * 111.0
        
        hour = random.randint(6, 22)
        day = random.randint(0, 6)
        
        # Traffic depends slightly on hour
        if hour in [7, 8, 9, 16, 17, 18]:
            traffic = random.choices(["Medium", "High"], weights=[0.4, 0.6])[0]
        else:
            traffic = random.choices(["Low", "Medium", "High"], weights=[0.6, 0.3, 0.1])[0]
            
        weather = random.choices(["Sunny", "Cloudy", "Rainy"], weights=[0.6, 0.3, 0.1])[0]
        
        # Base time assuming 40 km/h average speed in city
        base_time = (distance_km / 40.0) * 60.0 # in minutes
        
        travel_time = base_time * TRAFFIC_FACTORS[traffic] * WEATHER_FACTORS[weather]
        travel_time += np.random.normal(0, 0.1 * travel_time) # 10% noise
        
        deliveries.append({
            "distance": max(0.1, distance_km),
            "hour": hour,
            "day_of_week": day,
            "traffic_level": traffic,
            "weather": weather,
            "historical_travel_time": max(1.0, travel_time)
        })
        
    df_deliveries = pd.DataFrame(deliveries)
    
    os.makedirs(DATA_DIR, exist_ok=True)
    df_customers.to_csv(os.path.join(DATA_DIR, "customers.csv"), index=False)
    df_deliveries.to_csv(os.path.join(DATA_DIR, filename), index=False)
    
    return {"customers": df_customers, "deliveries": df_deliveries}

def get_customers() -> pd.DataFrame:
    path = os.path.join(DATA_DIR, "customers.csv")
    if os.path.exists(path):
        return pd.read_csv(path)
    return pd.DataFrame()
