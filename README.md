# Personalized Medication Side-Effect Predictor

⚠️ **DISCLAIMER: For demonstration purposes only — not medical advice. Consult a healthcare professional.**

An AI-powered web application that predicts potential medication side effects based on drug information and patient characteristics using a hybrid approach combining Rule-based logic, Machine Learning, and NLP.

## 🚀 Quick Start with Docker

```bash
# Clone and navigate to project
cd personalized-sideeffect-predictor

# Start all services
docker compose up --build

# Wait for services to start, then seed the database
curl -X POST http://localhost:5000/api/seed

# Open the app
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

## 📋 Features

- **Drug Search**: Autocomplete drug lookup from database
- **Patient Profiling**: Age, sex, and pre-existing conditions
- **Hybrid Prediction**: Combines rules, ML, and NLP scores
- **Explainability**: Shows contribution of each factor
- **Risk Levels**: Visual indicators (low/moderate/high)
- **Admin Panel**: Seed database and view training metrics

## 🏗️ Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │───▶│   Backend   │───▶│   MongoDB   │
│   (React)   │    │  (Node.js)  │    │             │
└─────────────┘    └──────┬──────┘    └─────────────┘
                          │
                   ┌──────▼──────┐
                   │   Python    │
                   │  ML/NLP     │
                   └─────────────┘
```

## 🔧 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/predict` | POST | Predict side effects |
| `/api/drugs?q=` | GET | Search drugs |
| `/api/seed` | POST | Seed DB & train model |
| `/api/health` | GET | Service health status |

### Predict Request Example

```bash
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{
    "drugName": "Aspirin",
    "age": 72,
    "sex": "M",
    "conditions": ["heart disease"]
  }'
```

## 🧪 Local Development (Without Docker)

### Backend
```bash
cd backend
npm install
pip install -r requirements.txt
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### MongoDB
```bash
# Install MongoDB locally or use Docker
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

## 🤖 Hybrid Algorithm

The prediction combines three approaches:

1. **Rule-based (35%)**: Age and condition risk multipliers
   - Elderly (65+): Higher risk for dizziness, confusion, bleeding
   - Liver disease: Amplifies hepatotoxicity risk

2. **ML Model (45%)**: Logistic regression trained on patient data
   - Features: age, sex, conditions, drug
   - Multi-label classification for side effects

3. **NLP (20%)**: TF-IDF similarity from drug descriptions
   - Frequency-based scoring from known side effects

Weights are configurable via environment variables.

## 📊 Training the Model

The model trains on synthetic patient data when you call:

```bash
POST /api/seed
```

This loads `seed_data.csv` (drugs) and `patient_examples.csv` (patient outcomes), then trains a OneVsRestClassifier.

## 🔒 Security

- Input validation with express-validator
- Rate limiting (100 requests/minute)
- CORS enabled
- No hardcoded secrets (use .env)

## ⚠️ Ethics & Safety

This tool is for **educational demonstration only**:

- NOT a substitute for medical advice
- Predictions are based on synthetic data
- Not clinically validated
- Should never be used for actual treatment decisions

### For Real-World Use

1. Import validated datasets (SIDER, FAERS)
2. Clinical validation with medical professionals
3. Regulatory compliance (FDA, HIPAA)
4. Proper model evaluation (ROC-AUC, clinical trials)

## 📁 Project Structure

```
personalized-sideeffect-predictor/
├── docker-compose.yml
├── README.md
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   └── api/
│   └── package.json
├── backend/
│   ├── server.js
│   ├── src/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── scripts/
│   └── package.json
└── infra/
    └── Dockerfiles/
```

## 🎯 Demo Walkthrough (60 seconds)

1. Open http://localhost:3000
2. Go to **Admin** → Click **Seed & Train**
3. Wait for success message
4. Go to **Predict** page
5. Enter: Aspirin, Age: 72, Male, Heart Disease
6. Click **Predict Side Effects**
7. View results with risk levels and explanations

## 📝 License

MIT License - For educational purposes only.


