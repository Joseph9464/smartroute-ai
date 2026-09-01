from typing import List, Dict, Any
import numpy as np
from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import pandas as pd

import time
import logging

logger = logging.getLogger(__name__)

from app.services.dataset_service import get_customers
from app.services.ml_service import predict_travel_times_bulk
from app.schemas.prediction import PredictionRequest
from app.schemas.optimization import OptimizationRequest, OptimizationResponse, VehicleRoute, RoutePoint

def calculate_distance_matrix(customers: pd.DataFrame, hour: int=10, day_of_week: int=2, traffic: str="Medium", weather: str="Sunny") -> (List[List[int]], List[List[float]]):
    n = len(customers)
    time_matrix = [[0] * n for _ in range(n)]
    dist_matrix = [[0.0] * n for _ in range(n)]
    
    coords = customers[['latitude', 'longitude']].values
    
    # Collect all requests
    reqs = []
    pairs = []
    for i in range(n):
        for j in range(n):
            if i != j:
                dist_km = np.sqrt((coords[i][0] - coords[j][0])**2 + (coords[i][1] - coords[j][1])**2) * 111.0
                dist_km = max(0.1, float(dist_km))
                reqs.append(PredictionRequest(
                    distance=dist_km, hour=hour, day_of_week=day_of_week, traffic_level=traffic, weather=weather
                ))
                pairs.append((i, j, dist_km))
                
    # Bulk predict
    preds = predict_travel_times_bulk(reqs)
    
    # Populate matrices
    for idx, (i, j, dist_km) in enumerate(pairs):
        pred_time = preds[idx]
        if np.isnan(pred_time) or np.isinf(pred_time):
            pred_time = dist_km * 2.0  # Fallback just in case
        time_matrix[i][j] = int(pred_time * 10)
        dist_matrix[i][j] = dist_km
        
    return time_matrix, dist_matrix

def run_optimization(req: OptimizationRequest) -> OptimizationResponse:
    start_time = time.time()
    logger.info(f"Starting optimization for {req.number_of_vehicles} vehicles with capacity {req.vehicle_capacity}.")
    
    df_customers = get_customers()
    if df_customers.empty:
        raise ValueError("No customer data available.")
        
    demands = df_customers['demand'].tolist()
    total_demand = sum(demands)
    total_capacity = req.number_of_vehicles * req.vehicle_capacity
    
    logger.info(f"Total demand: {total_demand}, Total capacity: {total_capacity}")
    if total_demand > total_capacity:
        raise ValueError(
            f"Infeasible problem: total demand ({total_demand}) exceeds total fleet capacity ({total_capacity})."
        )
        
    logger.info("Calculating distance and time matrices...")
    time_matrix, dist_matrix = calculate_distance_matrix(df_customers)
    
    data = {}
    data['time_matrix'] = time_matrix
    data['demands'] = demands
    data['num_vehicles'] = req.number_of_vehicles
    data['vehicle_capacities'] = [req.vehicle_capacity] * req.number_of_vehicles
    data['depot'] = 0
    
    logger.info("Initializing OR-Tools Routing Model...")
    manager = pywrapcp.RoutingIndexManager(len(data['time_matrix']), data['num_vehicles'], data['depot'])
    routing = pywrapcp.RoutingModel(manager)
    
    def time_callback(from_index, to_index):
        from_node = manager.IndexToNode(from_index)
        to_node = manager.IndexToNode(to_index)
        return data['time_matrix'][from_node][to_node]

    transit_callback_index = routing.RegisterTransitCallback(time_callback)
    routing.SetArcCostEvaluatorOfAllVehicles(transit_callback_index)
    
    # Add Capacity constraint
    def demand_callback(from_index):
        from_node = manager.IndexToNode(from_index)
        return data['demands'][from_node]

    demand_callback_index = routing.RegisterUnaryTransitCallback(demand_callback)
    routing.AddDimensionWithVehicleCapacity(
        demand_callback_index,
        0,  # null capacity slack
        data['vehicle_capacities'],  # vehicle maximum capacities
        True,  # start cumul to zero
        'Capacity'
    )
    
    search_parameters = pywrapcp.DefaultRoutingSearchParameters()
    search_parameters.first_solution_strategy = (routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC)
    search_parameters.local_search_metaheuristic = (routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH)
    search_parameters.time_limit.FromSeconds(10)
    
    logger.info("Starting solver with 10 seconds limit...")
    solution = routing.SolveWithParameters(search_parameters)
    
    if not solution:
        raise ValueError("No feasible VRP solution found. Check vehicle capacities and customer demands.")
        
    logger.info("Optimization successful. Extracting routes...")
    routes = []

    total_time = 0.0
    total_distance = 0.0
    
    for vehicle_id in range(data['num_vehicles']):
        index = routing.Start(vehicle_id)
        route_points = []
        route_time = 0.0
        route_dist = 0.0
        route_demand = 0
        
        while not routing.IsEnd(index):
            node_index = manager.IndexToNode(index)
            route_demand += data['demands'][node_index]
            
            customer = df_customers.iloc[node_index]
            route_points.append(RoutePoint(
                customer_id=int(customer['customer_id']),
                latitude=float(customer['latitude']),
                longitude=float(customer['longitude']),
                demand=int(customer['demand']),
                arrival_time=route_time / 10.0 # scale back
            ))
            
            previous_index = index
            index = solution.Value(routing.NextVar(index))
            if not routing.IsEnd(index):
                route_dist += dist_matrix[manager.IndexToNode(previous_index)][manager.IndexToNode(index)]
                route_time += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)

        # add the final return to depot
        node_index = manager.IndexToNode(index)
        customer = df_customers.iloc[node_index]
        route_time += routing.GetArcCostForVehicle(previous_index, index, vehicle_id)
        route_dist += dist_matrix[manager.IndexToNode(previous_index)][manager.IndexToNode(index)]
        
        route_points.append(RoutePoint(
            customer_id=int(customer['customer_id']),
            latitude=float(customer['latitude']),
            longitude=float(customer['longitude']),
            demand=0,
            arrival_time=route_time / 10.0
        ))
        
        if len(route_points) > 2: # More than just Start -> End
            routes.append(VehicleRoute(
                vehicle_id=vehicle_id,
                route=route_points,
                total_distance=float(route_dist),
                total_time=float(route_time / 10.0),
                total_demand=route_demand
            ))
            
            total_distance += route_dist
            total_time += route_time / 10.0
            
    logger.info("Running Baseline Nearest Neighbor Algorithm...")
    from app.services.baseline_service import run_nearest_neighbor
    baseline_result = run_nearest_neighbor(
        num_vehicles=req.number_of_vehicles,
        vehicle_capacity=req.vehicle_capacity,
        time_matrix=time_matrix,
        dist_matrix=dist_matrix,
        demands=demands,
        df_customers=df_customers
    )
    
    baseline_dist = baseline_result["total_distance"]
    baseline_time = baseline_result["total_time"]
    improvement = ((baseline_time - total_time) / baseline_time) * 100 if baseline_time > 0 else 0

    return OptimizationResponse(
        status="success",
        total_distance=float(total_distance),
        total_predicted_time=float(total_time),
        improvement=float(improvement),
        routes=routes,
        baseline_distance=baseline_dist,
        baseline_time=baseline_time,
        optimization_time=float(time.time() - start_time)
    )
