FROM python:3.9-slim

WORKDIR /app

# Install build dependencies if needed for some python packages
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
# Install PyTorch CPU version to keep image size small for development
RUN pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu
RUN pip install --no-cache-dir -r requirements.txt

COPY ai_engine.py .

# Run script with unbuffered output to see logs in docker
CMD ["python", "-u", "ai_engine.py"]
