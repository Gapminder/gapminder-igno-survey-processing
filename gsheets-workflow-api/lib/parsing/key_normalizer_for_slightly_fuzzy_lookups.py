import re

from unidecode import unidecode


def key_normalizer_for_slightly_fuzzy_lookups(lookup_key: str) -> str:
    trimmed_lower_cased_without_diacritics = unidecode(lookup_key.strip().lower())
    return re.sub(r"[^a-z0-9%\-.,<> ()]", "", trimmed_lower_cased_without_diacritics)
