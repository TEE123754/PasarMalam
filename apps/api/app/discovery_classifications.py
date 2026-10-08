from typing import Literal

from pydantic import BaseModel, ConfigDict

Category = Literal["rice", "skewers", "kuih", "drinks", "fried", "produce"]


class PlantDiet(BaseModel):
    model_config = ConfigDict(extra="forbid")
    vegetarian: Literal["unknown", "yes", "no"]
    vegan: Literal["unknown", "yes", "no"]
