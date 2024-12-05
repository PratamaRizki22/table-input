from abc import ABCMeta, abstractmethod
from src.domain.user import User


class UserUsecase(metaclass=ABCMeta):
  @abstractmethod
  async def create_user(self, user: User) -> User:
    raise NotADirectoryError
  