from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy import create_engine, Column, String, Date, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field
from typing import List
from datetime import date
import os
from fastapi.middleware.cors import CORSMiddleware 

# Mendapatkan URL koneksi dari environment
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@172.20.0.3:5432/testdb')

# SQLAlchemy setup
engine = create_engine(DATABASE_URL, echo=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Pydantic model untuk Penduduk
class PendudukBase(BaseModel):
    NIK: str = Field(..., alias="nik")
    Nama: str = Field(..., alias="nama")
    Tempat_Lahir: str = Field(..., alias="tempat_lahir")
    Tanggal_Lahir: date = Field(..., alias="tanggal_lahir")
    Jenis_Kelamin: str = Field(..., alias="jenis_kelamin")
    Agama: str = Field(..., alias="agama")
    Pekerjaan: str = Field(None, alias="pekerjaan")
    Kewarganegaraan: str = Field(..., alias="kewarganegaraan")

    class Config:
        orm_mode = True  # This allows SQLAlchemy models to be converted to Pydantic models

# Model untuk tabel penduduk (SQLAlchemy)
class PendudukSQLAlchemy(Base):
    __tablename__ = 'penduduk'

    nik = Column('nik', String(16), primary_key=True, index=True)
    nama = Column('nama', String(100), nullable=False)
    tempat_lahir = Column('tempat_lahir', String(100), nullable=False)
    tanggal_lahir = Column('tanggal_lahir', Date, nullable=False)
    jenis_kelamin = Column('jenis_kelamin', Enum('Laki-laki', 'Perempuan', name='jenis_kelamin'), nullable=False)
    agama = Column('agama', Enum('Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha', 'Konghucu', 'Lainnya', name='agama'), nullable=False)
    pekerjaan = Column('pekerjaan', String(100))
    kewarganegaraan = Column('kewarganegaraan', Enum('WNI', 'WNA', name='kewarganegaraan'), nullable=False)

# Membuat tabel di database (jika belum ada)
Base.metadata.create_all(bind=engine)

# FastAPI app setup
app = FastAPI()

# Menambahkan middleware CORS untuk mengizinkan akses dari frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://172.20.0.2:3000", 
        "http://localhost:3000", 
        "http://172.20.0.4:8000",
        ],
    allow_credentials=True,
    allow_methods=["*"],  # Mengizinkan semua metode HTTP (GET, POST, PUT, DELETE, dll.)
    allow_headers=["*"],  # Mengizinkan semua header
)

# Fungsi untuk mendapatkan session database
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoint untuk membaca semua data penduduk
@app.get("/penduduk/", response_model=List[PendudukBase])
def read_penduduk(db: Session = Depends(get_db)):
    penduduk_list = db.query(PendudukSQLAlchemy).all()
    
    if not penduduk_list:
        raise HTTPException(status_code=404, detail="No penduduk found")
    
    return [PendudukBase.from_orm(penduduk) for penduduk in penduduk_list]

# Endpoint untuk membaca penduduk berdasarkan NIK
@app.get("/penduduk/{nik}", response_model=PendudukBase)
def read_penduduk_by_nik(nik: str, db: Session = Depends(get_db)):
    penduduk = db.query(PendudukSQLAlchemy).filter(PendudukSQLAlchemy.nik == nik).first()

    if penduduk is None:
        raise HTTPException(status_code=404, detail="Penduduk not found")
    
    return PendudukBase.from_orm(penduduk)


@app.post("/penduduk/", response_model=PendudukBase)
def create_penduduk(penduduk: PendudukBase, db: Session = Depends(get_db)):
    # Cek apakah NIK sudah ada di database
    db_penduduk = db.query(PendudukSQLAlchemy).filter(PendudukSQLAlchemy.nik == penduduk.NIK).first()

    if db_penduduk:
        # Mengirimkan HTTPException dengan status 400 dan pesan error
        raise HTTPException(status_code=400, detail="NIK tidak boleh sama.")
    
    # Jika NIK belum ada, buat data baru
    db_penduduk = PendudukSQLAlchemy(
        nik=penduduk.NIK,
        nama=penduduk.Nama,
        tempat_lahir=penduduk.Tempat_Lahir,
        tanggal_lahir=penduduk.Tanggal_Lahir,
        jenis_kelamin=penduduk.Jenis_Kelamin,
        agama=penduduk.Agama,
        pekerjaan=penduduk.Pekerjaan,
        kewarganegaraan=penduduk.Kewarganegaraan
    )

    db.add(db_penduduk)
    db.commit()
    db.refresh(db_penduduk)
    
    return PendudukBase.from_orm(db_penduduk)


# Endpoint untuk memperbarui data penduduk
@app.put("/penduduk/{nik}", response_model=PendudukBase)
def update_penduduk(nik: str, penduduk: PendudukBase, db: Session = Depends(get_db)):
    db_penduduk = db.query(PendudukSQLAlchemy).filter(PendudukSQLAlchemy.nik == nik).first()
    if db_penduduk is None:
        raise HTTPException(status_code=404, detail="Penduduk not found")
    
    db_penduduk.nama = penduduk.Nama
    db_penduduk.tempat_lahir = penduduk.Tempat_Lahir
    db_penduduk.tanggal_lahir = penduduk.Tanggal_Lahir
    db_penduduk.jenis_kelamin = penduduk.Jenis_Kelamin
    db_penduduk.agama = penduduk.Agama
    db_penduduk.pekerjaan = penduduk.Pekerjaan
    db_penduduk.kewarganegaraan = penduduk.Kewarganegaraan

    db.commit()
    db.refresh(db_penduduk)
    return PendudukBase.from_orm(db_penduduk)

# Endpoint untuk menghapus data penduduk berdasarkan NIK
@app.delete("/penduduk/{nik}")
def delete_penduduk(nik: str, db: Session = Depends(get_db)):
    db_penduduk = db.query(PendudukSQLAlchemy).filter(PendudukSQLAlchemy.nik == nik).first()
    if db_penduduk is None:
        raise HTTPException(status_code=404, detail="Penduduk not found")
    
    db.delete(db_penduduk)
    db.commit()
    return {"message": "Penduduk deleted successfully"}

@app.get("/")
def read_root():
    try:
        with engine.connect() as connection:
            return {"message": "Successfully connected to PostgreSQL"}
    except Exception as e:
        return {"message": "Failed to connect to PostgreSQL", "error": str(e)}

class NIKCheck(BaseModel):
    NIK: str

@app.get("/penduduk/check-nik/{nik}", response_model=dict)
def check_nik(nik: str, db: Session = Depends(get_db)):
    # Mengecek apakah NIK sudah ada di database
    db_penduduk = db.query(PendudukSQLAlchemy).filter(PendudukSQLAlchemy.nik == nik).first()
    if db_penduduk:
        return {"isUnique": False}  # NIK sudah terdaftar
    return {"isUnique": True}  # NIK unik, belum terdaftar