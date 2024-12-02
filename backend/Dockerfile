# Gunakan image Python
FROM python:3.9-slim

# Set working directory di dalam container
WORKDIR /app

# Salin requirements.txt dan install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Salin folder backend ke dalam container
COPY backend /app/backend

# Jalankan FastAPI menggunakan Uvicorn
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
