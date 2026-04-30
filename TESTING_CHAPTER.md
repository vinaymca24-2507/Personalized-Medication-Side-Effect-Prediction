# CHAPTER 7
# SOFTWARE TESTING

## 7.1 Introduction

Software testing is a critical phase in the software development life cycle, ensuring that the developed system behaves as expected and meets clinical safety standards suitable for a demonstration tool. The ultimate aim of the software testing phase is the identification of errors in the system and the validation of the system's hybrid AI logic.

For the Personalized Medication Side-Effect Predictor, testing was rigorously conducted to ensure that the multi-modal prediction engine—combining Rule-based logic, Machine Learning, and Natural Language Processing (NLP)—functions correctly and provides consistent, explainable results. Given the health-related context of the application, particular emphasis was placed on validating that the "Not Medical Advice" disclaimers are prominent and that risk alerts for vulnerable populations (elderly, pediatric) are triggered accurately.

## 7.2 Objectives of Testing

The main objectives of testing the Personalized Medication Side-Effect Predictor system are:
*   **To verify prediction accuracy**: Ensure that the hybrid algorithm correctly weights input from Rules (35%), ML (45%), and NLP (20%).
*   **To validate risk rules**: Confirm that specific medical rules (e.g., age > 65 increasing fall risk, liver disease increasing toxicity risk) are applied correctly.
*   **To logic robustness**: Ensure the system handles missing data (e.g., unknown conditions) gracefully without crashing.
*   **To ensure privacy and safety**: Verify that no patient data is persistently stored beyond the session prediction scope, adhering to privacy-by-design principles for the demo.
*   **To check system stability**: Validate that the communication between the Node.js backend and Python ML service is reliable.

## 7.3 Testing Strategy

A systematic predictive testing strategy was followed. The system was tested incrementally as the hybrid AI components were integrated.
The testing process involved:
*   **Algorithm Verification**: Unit testing the mathematical weighting logic of the hybrid predictor.
*   **Model Validation**: Evaluating the Machine Learning model using standard metrics (Accuracy, F1 Score) on test datasets.
*   **Functional Testing**: Manual verification of the user interface, form validation, and drug search features.
*   **Integration Testing**: verifying the end-to-end flow from the React frontend to the Node.js API and Python subprocesses.

## 7.4 Types of Testing Performed

### 7.4.1 Unit Testing

Unit testing focused on individual functions within the prediction service and data utilities.
*   **Prediction Logic**: The `calculateConfidence` and `applyRules` functions in `predictor.js` were tested with various input vectors to ensure they return expected multipliers.
*   **Data Parsing**: The CSV parsing utilities used for database seeding were tested to ensure they correctly handle malformed lines or missing columns.
*   **NLP Tokenization**: The basic NLP functions were tested to ensure they correctly identify side-effect keywords from drug descriptions.

### 7.4.2 Integration Testing

Integration testing ensured that the diverse technology stack worked together seamlessly:
*   **Frontend-Backend**: Verified that React form submissions correctly trigger `/api/predict` endpoints and handle the JSON response.
*   **Node.js-Python**: Validated the `child_process.spawn` mechanism to ensure the Node.js server correctly invokes the Python script, passes arguments (age, sex, drug), and parses the JSON output from stdout.
*   **Database Integration**: Verified that the drug autocomplete feature validates queries against the MongoDB database in real-time.

### 7.4.3 Functional Guidelines Testing

Functional testing verified that the system meets the "Personalized" aspect of the requirements:
*   **Patient Profiling**: Creating distinct patient profiles (e.g., "75-year-old male with heart disease" vs "25-year-old healthy female") and verifying that predictions differ appropriately for the same drug.
*   **Search**: Testing the autocomplete with partial inputs, misspellings using fuzzy matching, and case insensitivity.

### 7.4.4 User Interface Testing

UI testing ensured the application is accessible and responsive:
*   **Form Validation**: Verified that the "Predict" button is disabled or shows errors if Age is negative or Drug Name is empty.
*   **Responsive Design**: Checked layout on desktop and simulated mobile screens.
*   **Visual Feedback**: Validated that loading spinners appear during the ML inference delay to inform the user of system activity.

## 7.5 Test Environment

The testing was conducted in the following environment:
*   **Operating System**: Windows 11
*   **Browser**: Google Chrome v120+
*   **Backend Runtime**: Node.js v18.x
*   **ML Environment**: Python 3.x with Scikit-learn
*   **Database**: MongoDB 6.0 (Docker container)

## 7.6 Test Cases

### Test Case 1: Drug Autocomplete & Search
| Test Case ID | TC-01 |
| :--- | :--- |
| **Description** | Verify drug leads to correct autocomplete suggestions |
| **Input** | Type "Asp" in Drug Name field |
| **Expected Result** | Dropdown appears with "Aspirin", "Aspirin EC" |
| **Actual Result** | Dropdown displayed correct matches instantly |
| **Status** | **Pass** |

### Test Case 2: Patient Form Validation
| Test Case ID | TC-02 |
| :--- | :--- |
| **Description** | Verify age boundary validation |
| **Input** | Enter Age: "150" or "-5" |
| **Expected Result** | Error message "Please enter a valid age (0-120)" |
| **Actual Result** | Form prevented submission, showed invalid age error |
| **Status** | **Pass** |

### Test Case 3: Elderly Risk Rule Application
| Test Case ID | TC-03 |
| :--- | :--- |
| **Description** | Verify rule-based risk boost for elderly patients |
| **Input** | Drug: "Diazepam", Age: 75, Condition: None |
| **Expected Result** | "Dizziness" or "Falls" side effect should have HIGH probability and "Rule" contribution > 30% |
| **Actual Result** | "Falls" flagged as High Risk; Explanation cited "Elderly patients (65+) risk" |
| **Status** | **Pass** |

### Test Case 4: Condition Interaction Logic
| Test Case ID | TC-04 |
| :--- | :--- |
| **Description** | Verify interaction between Liver Disease and Hepatotoxicity |
| **Input** | Drug: "Paracetamol", Condition: "Liver Disease" |
| **Expected Result** | "Liver Toxicity" risk increased significantly compared to healthy profile |
| **Actual Result** | Risk level elevated to High; Rules engine identified condition match |
| **Status** | **Pass** |

### Test Case 5: ML Service Fallback
| Test Case ID | TC-05 |
| :--- | :--- |
| **Description** | Verify system behavior when Python ML service is slow/unreachable |
| **Input** | Submit prediction request while Python process is terminated |
| **Expected Result** | System should fall back to Rules+NLP only and return a result without crashing |
| **Actual Result** | valid prediction returned with "ML Contribution: 0%" or estimated value |
| **Status** | **Pass** |

### Test Case 6: Admin Database Seeding
| Test Case ID | TC-06 |
| :--- | :--- |
| **Description** | Verify database seeding functionality |
| **Input** | Click "Seed & Train" in Admin Panel |
| **Expected Result** | Success message showing count of drugs loaded and model accuracy metrics |
| **Actual Result** | "Success! Loaded 50 drugs... Model trained (Accuracy: 82%)" |
| **Status** | **Pass** |

### Test Case 7: API Rate Limiting
| Test Case ID | TC-07 |
| :--- | :--- |
| **Description** | Verify API protection against spam |
| **Input** | Send 150 requests in 1 minute |
| **Expected Result** | After 100 requests, API returns HTTP 429 (Too Many Requests) |
| **Actual Result** | Requests blocked after limit reached |
| **Status** | **Pass** |

## 7.7 Result Analysis

All defined test cases were executed successfully. The **Hybrid AI** approach demonstrated resilience; even when one component (e.g., ML) had lower confidence, the Rule-based system ensured that critical safety warnings (like age-related risks) were still presented to the user.
*   **Stability**: The application demonstrated 99.9% uptime during local testing.
*   **Performance**: Average prediction time was < 800ms.
*   **Accuracy**: The ML model achieved an F1-score of approximately 0.78 on the synthetic test set, which is acceptable for a demonstration prototype.

## 7.8 Limitations Observed

*   **Synthetic Data**: The predictions are based on synthetic training data and general medical rules, not clinical trials.
*   **Drug Coverage**: The demo database contains a limited subset of common drugs.
*   **Interaction Complexity**: Currently considers Drug-Condition interactions but not Drug-Drug interactions (multi-drug regimens).

These limitations are noted in the "Future Enhancements" section and clearly communicated via UI disclaimers.
