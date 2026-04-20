import json
import time
import requests
import torch
import torch.nn as nn
from kafka import KafkaConsumer
import os

# Basic PyTorch Placeholder Model
# In the future, this is where you would load a trained model (e.g., YOLO, ResNet, or Custom CNN) 
# to perform computer vision on CCTV feeds.
class CrowdDensityModel(nn.Module):
    def __init__(self):
        super(CrowdDensityModel, self).__init__()
        # Simple placeholder mapping arbitrary feature sizes to a density 0-100%
        self.fc = nn.Linear(10, 1)

    def forward(self, x):
        # Using sigmoid to squash the output between 0 and 1, then scale to 0-100%
        return torch.sigmoid(self.fc(x)) * 100.0

def load_model():
    print("Loading PyTorch model...")
    model = CrowdDensityModel()
    model.eval()  # Set to inference mode
    return model

def process_stream(model):
    print("Connecting to Kafka broker...")
    # Add retry logic in case Kafka is still spinning up
    consumer = None
    
    # Check environment variable first, fallback to standard defaults
    kafka_broker = os.getenv('KAFKA_BROKER', None)
    brokers = [kafka_broker] if kafka_broker else ['kafka:9092', 'localhost:9092']
    
    for _ in range(10):
        try:
            # We try the first broker string that succeeds
            for broker in brokers:
                try:
                    consumer = KafkaConsumer(
                        'raw-sensor-data',
                        bootstrap_servers=[broker],
                        value_deserializer=lambda m: json.loads(m.decode('utf-8')) if m else {},
                        auto_offset_reset='latest'
                    )
                    print(f"Connected to Kafka at {broker}")
                    break
                except Exception:
                    continue
            if consumer:
                break
        except Exception as e:
            print(f"Waiting for Kafka... {e}")
            time.sleep(3)
            
    if not consumer:
        print("Failed to connect to Kafka after multiple retries. Exiting.")
        return

    print("Listening for sensor data on topic 'raw-sensor-data'...")
    
    for message in consumer:
        data = message.value
        # If payload is empty skip
        if not data:
            continue
            
        zone_id = data.get('zoneId', 'unknown-zone')
        print(f"Received raw data for Zone {zone_id}")
        
        # Simulate converting incoming raw data into a tensor
        # Currently creating a dummy random tensor for the PyTorch inference pass
        input_tensor = torch.randn(1, 10)
        
        # Run ML Inference block
        with torch.no_grad():
            predicted_density = model(input_tensor).item()
            
        print(f"AI Predicted Density: {predicted_density:.2f}%")
        
        # Send prediction to the Node.js decision engine
        payload = {
            "zoneId": zone_id,
            "densityPct": predicted_density
        }
        
        # Try configured backend_url (from env) or fallbacks
        env_backend_url = os.getenv('BACKEND_URL')
        backend_urls = [env_backend_url] if env_backend_url else ["http://backend:3001/api/simulate-sensor", "http://localhost:3001/api/simulate-sensor"]
        
        for backend_url in backend_urls:
            try:
                requests.post(backend_url, json=payload, timeout=2)
                print(f"Successfully sent prediction to backend at {backend_url}")
                break
            except Exception:
                continue

if __name__ == "__main__":
    model = load_model()
    process_stream(model)
