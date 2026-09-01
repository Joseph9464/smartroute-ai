import logging
from typing import List, Dict, Any
import pandas as pd

logger = logging.getLogger(__name__)

def run_nearest_neighbor(
    num_vehicles: int, 
    vehicle_capacity: int, 
    time_matrix: List[List[int]], 
    dist_matrix: List[List[float]],
    demands: List[int],
    df_customers: pd.DataFrame
) -> Dict[str, Any]:
    
    n = len(demands)
    unvisited = set(range(1, n))  # 0 is depot
    
    routes = []
    total_time = 0.0
    total_distance = 0.0
    
    for v in range(num_vehicles):
        if not unvisited:
            break
            
        current_node = 0
        current_load = 0
        route_time = 0.0
        route_dist = 0.0
        route_nodes = [0]
        
        while unvisited:
            # Find nearest neighbor
            best_node = None
            best_cost = float('inf')
            
            for candidate in unvisited:
                if current_load + demands[candidate] <= vehicle_capacity:
                    cost = time_matrix[current_node][candidate]
                    if cost < best_cost:
                        best_cost = cost
                        best_node = candidate
                        
            if best_node is None:
                # No more nodes can be visited by this vehicle due to capacity
                break
                
            # Move to best node
            route_time += time_matrix[current_node][best_node]
            route_dist += dist_matrix[current_node][best_node]
            current_load += demands[best_node]
            current_node = best_node
            route_nodes.append(current_node)
            unvisited.remove(current_node)
            
        # Return to depot
        route_time += time_matrix[current_node][0]
        route_dist += dist_matrix[current_node][0]
        route_nodes.append(0)
        
        if len(route_nodes) > 2:
            # Format route points
            route_points = []
            cumulative_time = 0.0
            
            for i in range(len(route_nodes)):
                node_idx = route_nodes[i]
                if i > 0:
                    cumulative_time += time_matrix[route_nodes[i-1]][node_idx] / 10.0
                    
                customer = df_customers.iloc[node_idx]
                route_points.append({
                    "customer_id": int(customer['customer_id']),
                    "latitude": float(customer['latitude']),
                    "longitude": float(customer['longitude']),
                    "demand": int(customer['demand']) if i != len(route_nodes)-1 else 0,
                    "arrival_time": cumulative_time
                })
                
            routes.append({
                "vehicle_id": v,
                "route": route_points,
                "total_distance": route_dist,
                "total_time": route_time / 10.0,
                "total_demand": current_load
            })
            
            total_time += route_time / 10.0
            total_distance += route_dist
            
    if unvisited:
        logger.warning(f"Baseline NN could not visit {len(unvisited)} customers due to strict vehicle constraints.")
        # We might not have a perfect feasible baseline if packing is tight, but we return what we have.
        
    return {
        "routes": routes,
        "total_distance": total_distance,
        "total_time": total_time
    }
