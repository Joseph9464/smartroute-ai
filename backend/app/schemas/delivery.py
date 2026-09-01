from pydantic import BaseModel
from typing import Optional

class Location(BaseModel):
    latitude: float
    longitude: float

class CustomerBase(Location):
    customer_id: int
    demand: int

class CustomerCreate(CustomerBase):
    pass

class Customer(CustomerBase):
    pass
