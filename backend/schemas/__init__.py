"""
ForgeFlow Lite - Pydantic Schemas
"""

from .menu import MenuCreate, MenuUpdate, MenuResponse, MenuDetail
from .screen import ScreenCreate, ScreenUpdate, ScreenResponse, ScreenDetail
from .feedback import FeedbackCreate, FeedbackResponse

# Forward reference 해결을 위한 model rebuild
MenuDetail.model_rebuild()
ScreenDetail.model_rebuild()

__all__ = [
    "MenuCreate",
    "MenuUpdate",
    "MenuResponse",
    "MenuDetail",
    "ScreenCreate",
    "ScreenUpdate",
    "ScreenResponse",
    "ScreenDetail",
    "FeedbackCreate",
    "FeedbackResponse",
]
