from sqlalchemy import Column, Integer, String, Numeric, Boolean, Text, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import declarative_base

Base = declarative_base()


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    category = Column(String(50), nullable=False)
    owner_name = Column(String(100), nullable=False)
    location = Column(String(150), nullable=False)
    rental_price_per_day = Column(Numeric(10, 2), nullable=False)
    available = Column(Boolean, nullable=False, default=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, server_default=func.now())
