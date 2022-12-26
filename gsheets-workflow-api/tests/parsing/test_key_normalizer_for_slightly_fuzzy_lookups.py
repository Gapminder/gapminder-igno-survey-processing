import pytest

from lib.parsing.key_normalizer_for_slightly_fuzzy_lookups import (
    key_normalizer_for_slightly_fuzzy_lookups,
)


@pytest.mark.parametrize(
    "lookup_key, expected_output",
    [
        ("Foo ", "foo"),
        ("Fóo*", "foo"),
        (" Bar", "bar"),
        ("  Baz  ", "baz"),
        (" Qux ", "qux"),
        (" Qux! ", "qux"),
        (" Qux$ ", "qux"),
        (" Qux& ", "qux"),
        (" Qux* ", "qux"),
        (" Qux+ ", "qux"),
        (" Qux/ ", "qux"),
        (" Qux= ", "qux"),
        (" Qux? ", "qux"),
        (" Qux@ ", "qux"),
        (" Qux[ ", "qux"),
        (" Qux] ", "qux"),
        (" Qux^ ", "qux"),
        (" Qux{ ", "qux"),
        (" Qux} ", "qux"),
        (" Qux| ", "qux"),
        (" Qux~ ", "qux"),
        (" Qux# ", "qux"),
        (" Qux$ ", "qux"),
        (" Qux& ", "qux"),
        (" Qux' ", "qux"),
        (" Qux` ", "qux"),
        (" Qux ", "qux"),
        (1, "1"),
        (1.0, "1.0"),
    ],
)
def test_key_normalizer_for_slightly_fuzzy_lookups(lookup_key, expected_output):
    output = key_normalizer_for_slightly_fuzzy_lookups(lookup_key)
    assert output == expected_output
