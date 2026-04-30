# USER MANUAL

## 1. Installation and Setup

### Prerequisites
*   Node.js (v16 or higher)
*   Docker (for MongoDB)
*   Git

### Steps
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/username/personalized-sideeffect-predictor.git
    cd personalized-sideeffect-predictor
    ```

2.  **Start Services**:
    Open a terminal and run the Docker Compose command to start the Database, Backend, and Frontend simultaneously:
    ```bash
    docker-compose up --build
    ```

3.  **Access Application**:
    Open your web browser (Chrome recommended) and navigate to:
    `http://localhost:3000`

---

## 2. System Initialization (First Run Only)

Before using the prediction features, the system database must be populated.

1.  Click on the **Admin** link in the top navigation bar.
2.  Locate the **Seed Database & Train Model** section.
3.  Click the **Seed & Train** button.
4.  **Wait** (approx. 10-15 seconds) until you see the success message: *"Success! Loaded X drugs and Y patient records."*
5.  Verify that the "System Status" indicators turn green (Model Loaded: Yes).

---

## 3. How to Predict Side Effects

1.  **Enter Drug Name**:
    *   On the Home page, start typing in the "Drug Name" field (e.g., "Asp").
    *   Select the correct drug from the dropdown list (e.g., "Aspirin").

2.  **Fill Patient Profile**:
    *   **Age**: Enter the patient's age (e.g., 72).
    *   **Sex**: Select Male or Female.
    *   **Conditions**: Check any pre-existing conditions that apply (e.g., "Heart Disease", "Liver Disease").

3.  **Get Prediction**:
    *   Click the **🔮 Predict Side Effects** button.

---

## 4. Interpreting Results

The results page displays a prioritized list of potential side effects.

*   **Risk Levels**:
    *   🔴 **High Risk**: >60% probability. High caution advised.
    *   🟡 **Moderate Risk**: 30-60% probability. Monitor symptoms.
    *   🟢 **Low Risk**: <30% probability. Standard awareness.

*   **Understanding the "Why"**:
    Look at the **Explanation** text on each card. It will tell you if the risk is elevated because of specific factors, e.g., *"Risk elevated due to age > 65"* or *"Interaction with Liver Disease detected"*.

*   **AI Confidence**:
    The badges (📋 Rule, 🤖 ML, 📝 NLP) show which part of the AI contributed most to this prediction, giving you insight into the reliability of the result.

---

**Note**: This tool is for educational demonstration only. Always consult a licensed healthcare professional for medical advice.
