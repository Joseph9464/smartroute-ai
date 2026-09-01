from fastapi import APIRouter
from app.services.dataset_service import generate_synthetic_data, get_customers

router = APIRouter()

@router.post("/generate")
def generate_data(num_customers: int = 50):
    result = generate_synthetic_data(num_customers=num_customers)
    return {"message": f"Generated {len(result['customers'])} customers and {len(result['deliveries'])} delivery records."}

@router.get("/")
def get_dataset():
    df = get_customers()
    if df.empty:
        return {"customers": []}
    return {"customers": df.to_dict(orient="records")}
