from typing import List, Optional

from pydantic import BaseModel


class Stats(BaseModel):
    max: int
    mean: float
    median: float
    min: int
    std: float


class ChoiceSummary(BaseModel):
    id: str
    count: int


class Row(BaseModel):
    id: str
    stats: Stats
    max: int
    total: int
    choices: List[ChoiceSummary]


class SummaryItem(BaseModel):
    answered: int
    skipped: int
    stats: Optional[Stats] = None
    choices: Optional[List[ChoiceSummary]] = None
    rows: Optional[List[Row]] = None
    text: Optional[int] = None


class QuestionRollup(BaseModel):
    id: str
    family: str
    subtype: str
    href: str
    summary: List[SummaryItem]
