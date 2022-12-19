from typing import Dict, List, Optional, Union


def find_in_list(
    the_list: List[Dict[str, Union[str, int, bool]]],
    attribute: str,
    value: Union[str, int, bool],
) -> Optional[Dict[str, Union[str, int, bool]]]:
    for x in the_list:
        if attribute not in x:
            raise Exception(f"Attribute {attribute} not found in {x}")
        if attribute in x and x[attribute] == value:
            break
    else:
        return None
    return x
