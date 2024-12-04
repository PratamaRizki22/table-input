from dataclasses import dataclass
from typing import Generic, List, TypeVar

# Definisi tipe generik
T = TypeVar('T')

@dataclass(frozen=True)
class Collection(Generic[T]):
    values: List[T]  # List tipe generik

    def map(self, func) -> map:
        return map(func, self.values)
