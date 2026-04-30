# Personalized Medication Side-Effect Predictor

## Your Guide to Understanding This Application

> ⚠️ **A Quick Note Before We Begin**: This tool is built purely for learning and demonstration. It's not meant to replace your doctor's advice—please always talk to a healthcare professional about your medications!

---

## What's Inside This Guide

1. [What Does This App Do?](#what-does-this-app-do)
2. [How Everything Connects](#how-everything-connects)
3. [The Tools We Used to Build This](#the-tools-we-used-to-build-this)
4. [Behind the Scenes](#behind-the-scenes)
5. [How Predictions Actually Work](#how-predictions-actually-work)
6. [How We Store Information](#how-we-store-information)
7. [Talking to the Server (API Guide)](#talking-to-the-server-api-guide)
8. [The User Interface](#the-user-interface)
9. [Getting It Running](#getting-it-running)
10. [Setting Up for Development](#setting-up-for-development)
11. [Tweaking the Settings](#tweaking-the-settings)
12. [Keeping Things Secure](#keeping-things-secure)
13. [What's Next?](#whats-next)

---

## What Does This App Do?

Imagine you're curious about what side effects a medication might cause—but not just in general. You want to know what might happen for *you* specifically, based on your age, health conditions, and other personal factors.

That's exactly what this application tries to help with. It's like having a smart assistant that looks at:
- **The medication itself** (what side effects are commonly reported)
- **Your personal details** (age, sex, existing health conditions)
- **Patterns from similar patients** (using machine learning)

Then it combines all of this to give you a personalized prediction of potential side effects, ranked by how likely they might be for someone like you.

### Here's What You Can Do With It

- 🔍 **Search for medications** with a smart autocomplete feature
- 👤 **Enter your profile** including age, sex, and any conditions you have
- 🎯 **Get personalized predictions** based on three different analysis methods
- 📊 **See clear risk levels** with easy-to-understand color coding (green for low, yellow for moderate, red for high)
- 💡 **Understand the "why"** behind each prediction—we show you what factors contributed
- ⚙️ **Admin tools** for loading data and training the prediction model

---

## How Everything Connects

Think of the app as having three main parts working together:

```
┌─────────────────────┐
│   What You See      │
│   (The Website)     │
│   Built with React  │
└──────────┬──────────┘
           │ 
           ▼ Your clicks and data
┌─────────────────────┐     ┌──────────────────┐
│   The Brain         │────▶│   The Memory     │
│   (Node.js Server)  │     │   (MongoDB)      │
└──────────┬──────────┘     └──────────────────┘
           │
           ▼ Number crunching
┌─────────────────────┐
│   The Smart Parts   │
│   (Python ML & NLP) │
└─────────────────────┘
```

**Here's how a typical prediction works:**

1. You fill out the form and click "Predict"
2. Your request travels to our Node.js server
3. The server looks up the drug in MongoDB
4. It then asks our Python services to run the smart analysis
5. Everything gets combined and sent back to you as a nice, readable result

---

## The Tools We Used to Build This

### On the Server Side

| What | Why We Chose It |
|------|-----------------|
| **Node.js** | Fast, great for handling lots of requests |
| **Express.js** | Makes building web servers a breeze |
| **MongoDB** | Perfect for storing varied drug data |
| **Mongoose** | Helps us talk to MongoDB in a clean way |
| **Python** | The go-to language for machine learning |
| **scikit-learn** | Excellent library for building prediction models |
| **pandas** | Makes working with data tables easy |

### On the Website Side

| What | Why We Chose It |
|------|-----------------|
| **React** | Building interactive UIs is smooth and fun |
| **Vite** | Super fast development experience |
| **React Router** | Handles page navigation seamlessly |
| **Axios** | Clean and simple way to talk to our server |

### For Deployment

| What | Why We Chose It |
|------|-----------------|
| **Docker** | Package everything up neatly |
| **Docker Compose** | Run all pieces with one command |
| **Nginx** | Efficiently serve the website |

---

## Behind the Scenes

### The Prediction Service

This is the conductor of our orchestra. When you ask for a prediction, this service:
- Gathers information from all three prediction methods
- Weighs them according to how much we trust each one
- Combines everything into a final score
- Writes up an explanation so you know *why* we think what we think

### The Machine Learning Service

This is our pattern-finder. We trained it on patient data so it learned things like "older patients taking Drug X often report dizziness." When you submit your info, it compares you to patterns it's seen before.

**How we taught it:**
- We showed it lots of patient profiles and their outcomes
- It learned which combinations of age, sex, conditions, and drugs lead to which side effects
- Now it can make educated guesses for new patients

### The NLP (Text Analysis) Service

This one reads drug descriptions and side effect lists. It understands which side effects are commonly mentioned together with which drugs, giving us another perspective on what to expect.

---

## How Predictions Actually Work

We don't rely on just one method—that would be putting all our eggs in one basket! Instead, we combine three different approaches:

### The Three Amigos of Prediction

| Method | Weight | What It Does |
|--------|--------|--------------|
| **Rules** | 35% | Applies established medical knowledge (like "elderly patients have higher fall risk") |
| **Machine Learning** | 45% | Finds patterns in data that humans might miss |
| **Text Analysis** | 20% | Extracts insights from drug documentation |

### Age-Based Rules (The Practical Stuff)

**For folks 65 and older:**
- Dizziness risk goes up by 50%
- Fall risk increases by 80%
- Confusion risk rises by 40%
- Bleeding risk jumps by 60%
- Drowsiness risk climbs by 30%

**For kids and teens (under 18):**
- We watch for growth-related effects (50% higher consideration)
- Behavioral changes get extra attention (40% higher)

### When Health Conditions Matter

If you have certain conditions, some side effects become more likely:

**Liver problems?**
- Liver toxicity risk doubles
- Nausea might be more common

**Kidney issues?**
- Kidney-related side effects need extra attention
- Fluid retention becomes a bigger concern

**Heart disease?**
- Heart rhythm issues are watched more closely
- Bleeding risk goes up (many heart patients take blood thinners)

**Diabetes, high blood pressure, asthma?**
- Each has its own set of side effects we pay special attention to

### Putting It All Together

Here's the simple formula:

```
Final Risk = (35% × Rules Score) + (45% × ML Score) + (20% × Text Score)
```

### What the Colors Mean

| Risk Level | What It Means | Color |
|------------|---------------|-------|
| **High** (70%+) | Worth discussing with your doctor | 🔴 Red |
| **Moderate** (40-69%) | Be aware, monitor if needed | 🟡 Yellow |
| **Low** (under 40%) | Less likely, but still possible | 🟢 Green |

---

## How We Store Information

### Drug Information

For each medication, we keep track of:
- Its name (and any other names people might call it)
- What it's used for
- Known side effects (how common they are, how serious they can be)
- Special considerations for different age groups
- Interactions with various health conditions

### Patient Records (For Training)

Our learning data includes:
- Which drug was taken
- Patient age and sex
- Pre-existing conditions
- What side effects actually happened

This helps our ML model learn from "experience."

---

## Talking to the Server (API Guide)

Want to integrate with our system or understand how the app communicates? Here's the technical stuff:

### Getting a Prediction

**Send this to:** `POST /api/predict`

**What to send:**
```json
{
  "drugName": "Aspirin",
  "age": 72,
  "sex": "M",
  "conditions": ["heart disease"]
}
```

**What you'll get back:**
```json
{
  "success": true,
  "drugName": "Aspirin",
  "predictions": [
    {
      "sideEffect": "Bleeding",
      "probability": 0.72,
      "riskLevel": "high",
      "reason": "Bleeding risk increases with age. Heart disease patients often take blood thinners..."
    }
  ],
  "confidence": 0.78
}
```

### Searching for Drugs

**Send this to:** `GET /api/drugs?q=asp`

You'll get back a list of matching medications.

### Setting Up the Database

**Send this to:** `POST /api/seed`

This loads all our sample data and trains the ML model. You only need to do this once!

### Checking if Everything's Working

**Send this to:** `GET /api/health`

You'll see if the model is loaded, what version it is, and other system status info.

---

## The User Interface

### The Home Page

This is where you'll spend most of your time. You'll see:
- A search box for finding your medication
- Input fields for your age and sex
- Checkboxes for any conditions you have
- A big friendly "Predict" button

### The Results Page

After clicking predict, you'll see:
- A summary showing the drug name and how confident we are in our predictions
- Your profile information
- A list of potential side effects, ranked from most to least likely
- For each side effect: probability bar, risk level, and a plain-English explanation

### The Admin Page

If you're setting things up or want to see training metrics:
- Button to seed the database and train the model
- Display of how well the model performed during training

---

## Getting It Running

### The Easy Way (Docker)

**What you'll need:** Docker and Docker Compose installed on your computer.

**Steps:**

1. Open your terminal and navigate to the project folder:
   ```bash
   cd personalized-sideeffect-predictor
   ```

2. Start everything up:
   ```bash
   docker compose up --build
   ```

3. Wait a minute or two for everything to start, then load the data:
   ```bash
   curl -X POST http://localhost:5000/api/seed
   ```
   
   Or just visit the Admin page and click "Seed & Train"!

4. Open your browser to:
   - **The app:** http://localhost:3000
   - **API directly:** http://localhost:5000

**To shut it down:**
```bash
docker compose down
```

**To completely reset (including database):**
```bash
docker compose down -v
```

---

## Setting Up for Development

If you want to modify the code or contribute:

### Backend Setup

```bash
cd backend
npm install
pip install -r requirements.txt
npm run dev
```

Create a `.env` file with:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/sideeffect_predictor
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Running MongoDB Locally

Quick way with Docker:
```bash
docker run -d -p 27017:27017 --name mongo mongo:6.0
```

---

## Tweaking the Settings

### Want to Change How Predictions Are Weighted?

Edit these environment variables:

| Setting | Default | What It Controls |
|---------|---------|------------------|
| `RULE_WEIGHT` | 0.35 | How much we trust the medical rules |
| `ML_WEIGHT` | 0.45 | How much we trust the machine learning |
| `NLP_WEIGHT` | 0.20 | How much we trust the text analysis |

**Pro tip:** These should add up to 1.0!

### Other Useful Settings

| Setting | Default | What It Does |
|---------|---------|--------------|
| `PORT` | 5000 | Which port the server runs on |
| `RATE_LIMIT_MAX_REQUESTS` | 100 | Max requests per minute (prevents abuse) |

---

## Keeping Things Secure

We've built in several protections:

- **Input checking:** We validate everything you send us to prevent bad data
- **Rate limiting:** Can't spam the server—there's a request limit
- **No secrets in code:** Sensitive stuff goes in environment variables
- **Clean error messages:** If something breaks, we don't expose internal details

---

## What's Next?

### Honest Limitations Right Now

Let's be upfront about what this demo version can't do:

1. **The data is synthetic** — We generated sample data for learning purposes, not real clinical records
2. **Limited drug list** — We have representative samples, not every medication
3. **No drug interactions** — We don't currently check what happens when you take multiple medications
4. **Basic text analysis** — We use straightforward methods, not the latest AI language models

### If This Were Going Into Production

Here's what we'd add:

**Better Data:**
- Connect to real pharmacovigilance databases (FDA FAERS, for example)
- Partner with healthcare providers for real-world outcomes

**Smarter AI:**
- Use more advanced machine learning (gradient boosting, neural networks)
- Add drug-drug interaction analysis
- Implement specialized medical language models

**Regulatory Compliance:**
- HIPAA compliance for patient data
- FDA software certification pathway
- Full audit logging

**Clinical Validation:**
- Performance testing against known outcomes
- Review by medical professionals
- Prospective studies to validate predictions

---

## Quick Reference

### Project Files at a Glance

```
personalized-sideeffect-predictor/
├── backend/              ← Server code
│   ├── server.js         ← Main entry point
│   └── src/
│       ├── services/     ← Prediction logic
│       ├── models/       ← Database schemas
│       └── routes/       ← API endpoints
├── frontend/             ← Website code
│   └── src/
│       ├── pages/        ← Main screens
│       └── components/   ← Reusable UI pieces
└── docker-compose.yml    ← One-click deployment
```

### Jargon Decoder

| Term | Plain English |
|------|---------------|
| **TF-IDF** | A way to figure out which words are most important in a document |
| **One-vs-Rest** | Training separate models for each possible side effect |
| **Logistic Regression** | A method for predicting yes/no outcomes |
| **Multi-label** | When one patient might have multiple side effects |
| **Feature Engineering** | Turning patient info into numbers the computer can work with |

---

## Need Help?

If you run into issues:

1. Make sure Docker is running
2. Check that ports 3000, 5000, and 27017 aren't in use
3. Try `docker compose down -v` and start fresh
4. Check the browser console and server logs for error messages

---

*Thanks for reading! Remember: this is a learning tool, not medical advice. When in doubt, ask a real doctor!* 🏥

---

*Document Version: 1.0.0*  
*Last Updated: December 2025*
