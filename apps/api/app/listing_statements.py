"""Explicit vendor statements; neither ingredients nor identity are inferred."""

from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, model_validator

Statement = Literal["unknown", "yes", "no"]
AllergenCode = Literal[
    "peanuts", "tree-nuts", "milk", "eggs", "soy", "wheat", "fish", "shellfish", "sesame", "other"
]


class BusinessDeclarations(BaseModel):
    model_config = ConfigDict(extra="forbid")
    pork_free: Statement
    alcohol_free: Statement
    muslim_owned: Statement


class AllergenStatement(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: Literal["unknown", "confirmed"]
    contains: list[AllergenCode] = Field(max_length=10)
    cross_contact: Literal["unknown", "possible"]

    @model_validator(mode="after")
    def consistent(self):
        if len(set(self.contains)) != len(self.contains) or (
            self.status == "unknown" and self.contains
        ):
            raise ValueError("Confirm the statement or leave it unknown")
        return self
