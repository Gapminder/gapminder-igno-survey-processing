from operator import attrgetter
from typing import Any, List, Optional, TypeVar

T = TypeVar("T")


def find_by_attribute(lst: List[T], attr: str, value: Any) -> Optional[T]:
    getter = attrgetter(attr)
    return next(
        (item for item in lst if hasattr(item, attr) and getter(item) == value), None
    )
