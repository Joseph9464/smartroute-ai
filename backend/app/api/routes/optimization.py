from fastapi import APIRouter, HTTPException
from app.schemas.optimization import OptimizationRequest, OptimizationResponse
from app.services.optimization_service import run_optimization

import logging
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/run", response_model=OptimizationResponse)
def optimize(req: OptimizationRequest):
    try:
        response = run_optimization(req)
        return response
    except Exception as e:
        logger.exception("VRP optimization failed")
        raise HTTPException(
            status_code=500,
            detail=f"Optimization failed: {str(e)}"
        )
