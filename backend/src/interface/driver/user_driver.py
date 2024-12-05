from abc import ABCMeta, abstractmethod
from src.domain.user import User  

class UserDriver(metaclass=ABCMeta):
  @abstractmethod
  async def create_user(self, user:User ) -> dict:
    raise NotImplementedError