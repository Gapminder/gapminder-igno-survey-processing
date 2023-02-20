from typing import Any, Dict, List, Optional

from pydantic import BaseModel


class ButtonsText(BaseModel):
    next_button: str
    prev_button: str
    done_button: str
    exit_button: str


class RequiredItem(BaseModel):
    text: str
    type: Optional[str]
    amount: Optional[str]


class ValidationItem(BaseModel):
    type: str
    text: str
    max: str
    min: str
    sum: Any
    sum_text: str


class Image(BaseModel):
    url: str


class Heading(BaseModel):
    heading: Optional[str] = None
    image: Optional[Image] = None


class QuizOptions(BaseModel):
    score: int


class Choice(BaseModel):
    position: int
    visible: bool
    text: str
    quiz_options: Optional[QuizOptions] = None
    id: str
    is_na: Optional[bool] = None
    weight: Optional[int] = None
    description: Optional[str] = None


class Row(BaseModel):
    position: int
    visible: bool
    text: str
    id: str


class Answers(BaseModel):
    choices: List[Choice]
    rows: Optional[List[Row]] = None


class CustomOptions(BaseModel):
    starting_position: int
    step_size: int
    option_set: List[str]


class DisplayOptions(BaseModel):
    show_display_number: bool
    display_type: Optional[str] = None
    display_subtype: Optional[str] = None
    left_label_id: Optional[str] = None
    left_label: Optional[str] = None
    right_label_id: Optional[str] = None
    right_label: Optional[str] = None
    middle_label_id: Optional[Any] = None
    middle_label: Optional[str] = None
    custom_options: Optional[CustomOptions] = None
    file_upload_labels: Optional[Dict[str, Any]] = None


class Question(BaseModel):
    id: str
    position: int
    visible: bool
    family: str
    subtype: str
    layout: Any
    sorting: Any
    required: Optional[RequiredItem]
    validation: Optional[ValidationItem]
    forced_ranking: bool
    headings: List[Heading]
    href: str
    answers: Optional[Answers] = None
    display_options: Optional[DisplayOptions] = None


class Page(BaseModel):
    title: str
    description: str
    position: int
    question_count: int
    id: str
    href: str
    questions: List[Question]


class Survey(BaseModel):
    title: str
    nickname: str
    language: str
    folder_id: str
    category: str
    question_count: int
    page_count: int
    response_count: int
    date_created: str
    date_modified: str
    id: str
    buttons_text: ButtonsText
    is_owner: bool
    footer: bool
    theme_id: str
    custom_variables: Dict[str, Any]
    href: str
    analyze_url: str
    edit_url: str
    collect_url: str
    summary_url: str
    preview: str
    pages: List[Page]
