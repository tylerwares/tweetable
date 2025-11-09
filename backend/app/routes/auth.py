from typing import Any, Dict

from fastapi import APIRouter, Depends

from ..utils.auth import get_current_user

router = APIRouter(prefix='/auth', tags=['auth'])


@router.get('/me')
async def read_current_user(user: Dict[str, Any] = Depends(get_current_user)):
    return {'user': user}
