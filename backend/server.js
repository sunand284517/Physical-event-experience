const express = require('express');
const cors = require('cors');
const { Kafka } = require('kafkajs');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// Basic Kafka Setup (Mock)
const kafka = new Kafka({
  clientId: 'crowd-decision-engine',
  brokers: ['localhost:9092']
});

// Mock Rules Engine Evaluation
function evaluateCrowdDensity(zoneId, densityPct) {
    if (densityPct > 85) {
        return { action: 'STOP_ENTRY', zone: zoneId, alertLevel: 'CRITICAL' };
    } else if (densityPct > 70) {
        return { action: 'REDIRECT', zone: zoneId, alertLevel: 'WARNING' };
    }
    return { action: 'NORMAL', zone: zoneId, alertLevel: 'INFO' };
}

// REST API for Admin Dashboard
app.get('/api/status', (req, res) => {
    res.json({ status: 'active', activeGates: 12, totalDensity: 45 });
});

app.post('/api/simulate-sensor', (req, res) => {
    const { zoneId, densityPct } = req.body;
    const decision = evaluateCrowdDensity(zoneId, densityPct);
    
    // In a real scenario, this decision would be pushed back to Kafka or MQTT to control smart gates
    res.json({ received: true, action: decision.action });
});

app.listen(PORT, () => {
    console.log(`🧠 Central Decision Engine running on port ${PORT}`);
});
