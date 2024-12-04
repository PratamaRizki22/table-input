from dataclasses import dataclass
from typing import Optional, List
from datetime import date
from src.domain.collection import Collection


@dataclass(frozen=True)
class User:
    nik: str
    nama: str
    tempat_lahir: str
    tanggal_lahir: date
    jenis_kelamin: str  
    agama: str          
    pekerjaan: Optional[str]
    kewarganegaraan: str  


@dataclass(frozen=True)
class Users(Collection[User]):
    values: List[User]
