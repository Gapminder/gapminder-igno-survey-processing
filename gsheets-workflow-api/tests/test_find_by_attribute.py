from typing import List, Optional, Type

import pytest

from lib.find_by_attribute import find_by_attribute


class Person:
    def __init__(self, name: str, age: int):
        self.name = name
        self.age = age

    def __eq__(self, other: object) -> bool:
        if isinstance(other, Person):
            return self.name == other.name and self.age == other.age
        return False


class TestFindByAttribute:
    @pytest.mark.parametrize(
        "lst, attr, value, expected",
        [
            (
                [Person("Alice", 25), Person("Bob", 30)],
                "name",
                "Bob",
                Person("Bob", 30),
            ),
            ([Person("Alice", 25), Person("Bob", 30)], "age", 25, Person("Alice", 25)),
            ([Person("Alice", 25), Person("Bob", 30)], "address", "home", None),
        ],
    )
    def test_find_by_attribute(
        self, lst: List[Type], attr: str, value: str, expected: Optional[Person]
    ):
        result = find_by_attribute(lst, attr, value)
        if expected:
            assert result == expected, f"Expected {expected} but got {result}"
        else:
            assert result is None
