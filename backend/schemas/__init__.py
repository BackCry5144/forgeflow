"""
ForgeFlow - Pydantic Schemas
"""

from .menu import MenuCreate, MenuUpdate, MenuResponse, MenuDetail
from .screen import ScreenCreate, ScreenUpdate, ScreenResponse

# Forward reference 해결을 위한 model rebuild
MenuDetail.model_rebuild()

__all__ = [
    "MenuCreate",
    "MenuUpdate",
    "MenuResponse",
    "MenuDetail",
    "ScreenCreate",
    "ScreenUpdate",
    "ScreenResponse",
]
