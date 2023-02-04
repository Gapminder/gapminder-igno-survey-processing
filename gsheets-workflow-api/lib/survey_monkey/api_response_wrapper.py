from typing import Generic, List, Optional, TypeVar

from pydantic.main import BaseModel

T = TypeVar("T")


class Links(BaseModel):
    self: str
    next: Optional[str]
    last: Optional[str]


class GenericApiResponse(BaseModel, Generic[T]):
    data: List[T]
    per_page: int
    page: int
    total: int
    links: Links
