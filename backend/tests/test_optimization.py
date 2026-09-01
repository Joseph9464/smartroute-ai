import pytest
from app.services.dataset_service import generate_synthetic_data
from app.services.optimization_service import run_optimization
from app.schemas.optimization import OptimizationRequest
from app.services.ml_service import train_model

def test_data_generation():
    result = generate_synthetic_data(15, "test_data.csv")
    assert len(result["customers"]) == 16  # 15 + depot
    assert len(result["deliveries"]) > 0

def test_optimization_infeasible():
    # Force infeasibility
    generate_synthetic_data(10, "test_data.csv")
    
    req = OptimizationRequest(
        number_of_vehicles=1,
        vehicle_capacity=1  # Intentionally too small
    )
    with pytest.raises(ValueError, match="total demand .* exceeds total fleet capacity"):
        run_optimization(req)
