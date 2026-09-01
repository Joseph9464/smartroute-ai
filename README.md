# SmartRoute AI

**AI-Assisted Vehicle Routing Optimization**

SmartRoute AI is a full-stack platform that combines **Machine Learning** and **Mathematical Optimization** to solve complex delivery routing problems. It predicts travel times dynamically based on traffic and weather conditions using a Random Forest model, and uses Google OR-Tools to solve the Capacitated Vehicle Routing Problem (CVRP).

## Project Architecture

```text
                    ┌─────────────────────┐
                    │ Historical Data     │
                    │ (Synthetic Gen)     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Machine Learning    │
                    │ Prediction Engine   │
                    │ (Random Forest)     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Optimization Engine │
                    │ (Google OR-Tools)   │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │ Interactive Map     │
                    │ (React Leaflet)     │
                    └─────────────────────┘
```

## Features
- **Machine Learning**: Predicts travel time given geographic distance, time of day, weather, and traffic.
- **Optimization**: Solves the CVRP using a Guided Local Search metaheuristic to minimize total expected travel time.
- **Interactive UI**: A unified dashboard built with React and Tailwind CSS that allows end-to-end data generation, training, and route visualization.
- **Deployment**: Fully dockerized backend (FastAPI) and frontend (Vite).

## Installation & Running

Ensure you have Docker and Docker Compose installed. 

1. Clone or navigate to the repository.
2. Start the services using Docker:
   ```bash
   docker compose up --build
   ```
3. Access the frontend at `http://localhost:5173`.
4. Access the API documentation at `http://localhost:8000/docs`.

## Mathematical Formulation

The core optimization problem is the Capacitated Vehicle Routing Problem (CVRP). 

Let $x_{ijk}$ be a binary variable equal to $1$ if vehicle $k$ travels from customer $i$ to customer $j$, and $0$ otherwise. 

### Objective Function
Minimize the total predicted travel time:
$$
\min \sum_k \sum_i \sum_j T_{ij} x_{ijk}
$$
Where $T_{ij}$ is the travel time predicted by the Machine Learning model.

### Constraints
1. **Customer Visit**: Each customer must be visited exactly once.
2. **Vehicle Capacity**: Total demand assigned to each vehicle cannot exceed its capacity.
3. **Depot**: Each vehicle starts and ends at the depot.
4. **Flow Conservation**: If a vehicle enters a customer node, it must leave that node.
5. **Subtour Elimination**: The solution avoids disconnected cycles.

## API Documentation

- `POST /api/datasets/generate`: Generates synthetic customer and historical delivery data.
- `POST /api/ml/train`: Trains the Random Forest Regressor and outputs RMSE/MAE/R².
- `POST /api/ml/predict`: Predicts the travel time for a single delivery route.
- `POST /api/optimization/run`: Solves the CVRP for a configured number of vehicles and capacity.

## Future Improvements
- **Model Comparison**: Integrate Gradient Boosting (XGBoost) and Linear Regression for performance comparison.
- **Alternate Solvers**: Provide implementations using Pyomo and HiGHS.
- **Data Upload**: Allow users to upload CSVs of their own real-world delivery data.
- **Multi-Objective Optimization**: Balance travel time, distance, and workload fairness.
