from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    role = Column(String)  # USER / ADMIN

    meters = relationship("Meter", back_populates="user")


class Meter(Base):
    __tablename__ = "meters"

    id = Column(Integer, primary_key=True)
    meter_code = Column(String, unique=True)
    pin = Column(String)

    category = Column(String)
    barrio = Column(String)
    calle = Column(String)
    numero = Column(String)
    predio = Column(String)

    # ✅ PRECIOS (opción 1: solo en Meter)
    price_per_liter = Column(Float, default=0.50)
    currency = Column(String, default="BOB")

    # ✅ ForeignKey correcto (SIN links)
    user_id = Column(Integer, ForeignKey("users.id"))
    user = relationship("User", back_populates="meters")

    readings = relationship(
        "Reading",
        back_populates="meter",
        cascade="all, delete-orphan"
    )


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True)

    # ✅ ForeignKey correcto (SIN links)
    meter_id = Column(Integer, ForeignKey("meters.id"))

    timestamp = Column(DateTime, default=datetime.utcnow)
    flow_lps = Column(Float)
    liters_delta = Column(Float)
    liters_total = Column(Float)

    meter = relationship("Meter", back_populates="readings")