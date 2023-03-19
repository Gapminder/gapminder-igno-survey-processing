from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class CustomValue(BaseModel):
    type: str
    value: str


class Contact(BaseModel):
    custom_value: CustomValue


class Metadata(BaseModel):
    contact: Contact


class Answer(BaseModel):
    choice_id: Optional[str] = None
    tag_data: Optional[List] = None
    text: Optional[str] = None


class Question(BaseModel):
    id: str
    answers: List[Answer]


class Page(BaseModel):
    id: str
    questions: List[Question]


class Response(BaseModel):
    id: str
    recipient_id: str
    collection_mode: str
    response_status: str
    custom_value: str
    first_name: str
    last_name: str
    email_address: str
    ip_address: str
    logic_path: Dict[str, Any]
    metadata: Metadata
    page_path: List
    collector_id: str
    survey_id: str
    custom_variables: Dict[str, Any]
    edit_url: str
    analyze_url: str
    total_time: int
    date_modified: str
    date_created: str
    href: str
    pages: List[Page]
