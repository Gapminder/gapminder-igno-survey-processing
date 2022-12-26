import re
from typing import Any

from unidecode import unidecode


def key_normalizer_for_slightly_fuzzy_lookups(lookup_key: Any) -> str:
    trimmed_lower_cased_without_diacritics = unidecode(str(lookup_key).strip().lower())
    return re.sub(r"[^a-z0-9%\-.,<> ()]", "", trimmed_lower_cased_without_diacritics)
