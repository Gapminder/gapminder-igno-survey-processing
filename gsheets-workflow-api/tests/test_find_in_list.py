import pytest

from lib.find_in_list import find_in_list


def test_find_in_list():
    assert find_in_list(
        [{"foo": "bar"}, {"foo": "gar"}, {"zoo": "tar"}], "foo", "bar"
    ) == {"foo": "bar"}
    assert find_in_list([{"foo": "bar"}, {"foo": "gar"}], "foo", "gar") == {
        "foo": "gar"
    }
    with pytest.raises(Exception) as excinfo:
        find_in_list([{"foo": "bar"}, {"foo": "gar"}], "boo", "gar")
    assert str(excinfo.value) == "Attribute boo not found in {'foo': 'bar'}"
    with pytest.raises(Exception) as excinfo:
        find_in_list([{"foo": "bar"}, {"foo": "gar"}, {"zoo": "tar"}], "foo", "jar")
    assert str(excinfo.value) == "Attribute foo not found in {'zoo': 'tar'}"
    # assert find_in_list([{"foo": "bar"}, {"foo": "gar"}, {"zoo": "tar"}], "foo", "jar") is None
