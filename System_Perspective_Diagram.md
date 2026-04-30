# System Perspective Diagram

## Personalized Medication Side-Effect Predictor

This diagram illustrates the high-level architecture and interactions between the major components of the Personalized Medication Side-Effect Predictor system.

```mermaid
graph TB
    subgraph ClientLayer["Client Layer"]
        Browser["User Browser"]
        ReactApp["React 18 Frontend<br/>(Vite + React Router)"]
    end

    subgraph APILayer["API Layer"]
        NodeServer["Node.js/Express.js<br/>REST API Server"]
        RateLimiter["Rate Limiter<br/>& Validation"]
        WinstonLogger["Winston Logger"]
    end

    subgraph MLLayer["AI/ML Layer"]
        subgraph HybridAI["Hybrid AI Engine"]
            RulesBased["Rule-Based<br/>Medical Logic<br/>(35% weight)"]
            MLModel["Machine Learning<br/>Classifier<br/>(45% weight)"]
            NLPEngine["NLP/TF-IDF<br/>Analysis<br/>(20% weight)"]
        end
        PythonService["Python ML Service<br/>(scikit-learn)"]
    end

    subgraph DataLayer["Data Layer"]
        MongoDB["MongoDB Database"]
        DrugData["Drug Information<br/>Collection"]
        PredictionLogs["Prediction<br/>Logs"]
    end

    subgraph DevOps["Infrastructure"]
        Docker["Docker Containers"]
        DockerCompose["Docker Compose<br/>Orchestration"]
    end

    Browser -->|"HTTP Request"| ReactApp
    ReactApp -->|"Axios API Call"| NodeServer
    NodeServer --> RateLimiter
    RateLimiter -->|"Validated Request"| PythonService
    NodeServer --> WinstonLogger
    
    PythonService --> RulesBased
    PythonService --> MLModel
    PythonService --> NLPEngine
    
    RulesBased -->|"Combined Prediction"| PythonService
    MLModel -->|"Combined Prediction"| PythonService
    NLPEngine -->|"Combined Prediction"| PythonService
    
    PythonService -->|"Personalized<br/>Risk Assessment"| NodeServer
    NodeServer -->|"JSON Response"| ReactApp
    ReactApp -->|"Display Results"| Browser
    
    NodeServer <-->|"Query/Store"| MongoDB
    MongoDB --> DrugData
    MongoDB --> PredictionLogs
    
    Docker --> ReactApp
    Docker --> NodeServer
    Docker --> PythonService
    Docker --> MongoDB
    DockerCompose --> Docker

    style Browser fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style ReactApp fill:#e3f2fd,stroke:#1565c0,stroke-width:2px
    style NodeServer fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style RateLimiter fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style WinstonLogger fill:#fff3e0,stroke:#ef6c00,stroke-width:2px
    style PythonService fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style RulesBased fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MLModel fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style NLPEngine fill:#e8f5e9,stroke:#2e7d32,stroke-width:2px
    style MongoDB fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style DrugData fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style PredictionLogs fill:#fce4ec,stroke:#c2185b,stroke-width:2px
    style Docker fill:#eceff1,stroke:#455a64,stroke-width:2px
    style DockerCompose fill:#eceff1,stroke:#455a64,stroke-width:2px
```

---

## Component Descriptions

### Client Layer

| Component | Technology | Responsibilities |
|-----------|------------|------------------|
| **User Browser** | Web Browser | End-user interface for medication queries and viewing personalized predictions |
| **React Frontend** | React 18, Vite, React Router | Single-page application with responsive UI, form inputs for patient data, and visualizing side effect predictions |

### API Layer

| Component | Technology | Responsibilities |
|-----------|------------|------------------|
| **Node.js/Express Server** | Node.js, Express.js | RESTful API handling all client requests, routing, and response formatting |
| **Rate Limiter & Validation** | express-validator | Input validation, sanitization, and protection against abuse |
| **Winston Logger** | Winston | Comprehensive logging for monitoring, debugging, and audit trails |

### AI/ML Layer (Hybrid AI Engine)

| Component | Weight | Responsibilities |
|-----------|--------|------------------|
| **Rule-Based Medical Logic** | 35% | Encodes established medical knowledge—age-specific risks (elderly 65+, pediatric), condition-drug interactions, demographic factors |
| **Machine Learning Classifier** | 45% | OneVsRestClassifier with Logistic Regression trained on patient data to identify complex patterns in side effect occurrences |
| **NLP/TF-IDF Analysis** | 20% | Text analysis of drug descriptions to extract semantic relationships between medications and side effects |
| **Python ML Service** | scikit-learn, pandas, NumPy | Orchestrates all AI components, feature engineering, model training, and prediction generation |

### Data Layer

| Component | Technology | Responsibilities |
|-----------|------------|------------------|
| **MongoDB Database** | MongoDB, Mongoose ODM | Flexible NoSQL storage for complex drug information with varying structures |
| **Drug Information** | MongoDB Collection | Stores medication data, side effects, contraindications, and descriptions |
| **Prediction Logs** | MongoDB Collection | Maintains history of predictions for analytics and model improvement |

### Infrastructure

| Component | Technology | Responsibilities |
|-----------|------------|------------------|
| **Docker Containers** | Docker | Containerization for consistent deployment across environments |
| **Docker Compose** | docker-compose.yml | Multi-service orchestration of frontend, backend, Python ML, and database |

---

## Data Flow

```mermaid
sequenceDiagram
    autonumber
    participant User as 👤 Patient
    participant React as React Frontend
    participant Express as Express.js API
    participant Python as Python ML Service
    participant Rules as Rule-Based Logic
    participant ML as ML Classifier
    participant NLP as NLP Engine
    participant DB as MongoDB

    User->>React: Enter Patient Profile<br/>(Age, Sex, Conditions, Drug)
    React->>Express: POST /api/predict
    Express->>Express: Validate & Sanitize Input
    Express->>DB: Fetch Drug Information
    DB-->>Express: Drug Data
    Express->>Python: Request Prediction
    
    par Hybrid AI Processing
        Python->>Rules: Apply Medical Rules
        Python->>ML: Run ML Classifier
        Python->>NLP: Analyze Drug Text
    end
    
    Rules-->>Python: Rule-Based Score
    ML-->>Python: ML Probability
    NLP-->>Python: NLP Score
    
    Python->>Python: Combine Weighted Predictions<br/>(35% + 45% + 20%)
    Python-->>Express: Personalized Risk Assessment<br/>with Explanations
    
    Express->>DB: Log Prediction
    Express-->>React: JSON Response
    React-->>User: Display Personalized<br/>Side Effect Predictions
```

---

## Key System Features

### Explainability & Transparency
- ✅ Every prediction includes detailed explanation of contributing factors
- ✅ Users see how age, sex, and conditions influenced each side effect probability
- ✅ System shows which prediction method contributed most (Rules, ML, or NLP)
- ✅ Confidence scores indicate prediction reliability

### Security & Reliability
- 🔒 Rate limiting protects against API abuse
- 🔒 Input validation and sanitization prevents injection attacks
- 🔒 Environment-based configuration for secrets management
- 🔒 CORS configuration for secure cross-origin requests

### Scalability
- 📈 Containerized architecture supports horizontal scaling
- 📈 MongoDB's flexible schema handles growing drug databases
- 📈 Stateless API design enables load balancing
- 📈 Modular AI components can be upgraded independently

---

## Technology Stack Summary

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 18, Vite, React Router, Axios, CSS |
| **Backend** | Node.js, Express.js, express-validator, Winston |
| **AI/ML** | Python 3, scikit-learn, pandas, NumPy, TF-IDF |
| **Database** | MongoDB, Mongoose ODM |
| **DevOps** | Docker, Docker Compose |
| **Architecture** | Microservices, RESTful API, Hybrid AI |

---

*Image 4.1: System Perspective Diagram for Personalized Medication Side-Effect Predictor*
