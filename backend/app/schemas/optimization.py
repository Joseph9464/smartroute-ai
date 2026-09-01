from pydantic import BaseModel
from typing import List
from app.schemas.delivery import Customer, Location

class OptimizationRequest(BaseModel):
    number_of_vehicles: int
    vehicle_capacity: int
    objective: str = "minimize_travel_time"

class RoutePoint(BaseModel):
    customer_id: int
    latitude: float
    longitude: float
    demand: int
    arrival_time: float

class VehicleRoute(BaseModel):
    vehicle_id: int
    route: List[RoutePoint]
    total_distance: float
    total_time: float
    total_demand: int

class OptimizationResponse(BaseModel):
    status: str
    total_distance: float
    total_predicted_time: float
    improvement: float
    routes: List[VehicleRoute]
    baseline_distance: float = 0.0
    baseline_time: float = 0.0
    optimization_time: float = 0.0

