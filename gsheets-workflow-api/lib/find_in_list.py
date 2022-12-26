from typing import Dict, List, Optional, Type, TypeVar

_T = TypeVar("_T")


def find_in_list(
    the_list: List[Dict[str, Type[_T]]],
    attribute: str,
    value: Type[_T],
) -> Optional[Dict[str, Type[_T]]]:
    for x in the_list:
        if attribute not in x:
            raise Exception(f"Attribute {attribute} not found in {x}")
        if attribute in x and x[attribute] == value:
            break
    else:
        return None
    return x
