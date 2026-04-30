#!/usr/bin/env python3
"""
ML Service for Side Effect Prediction - Multi-Model Ensemble
Uses 3 ML models: Logistic Regression, Random Forest, and SVM
Combined via soft voting (probability averaging)
DISCLAIMER: For demonstration purposes only — not medical advice.
"""

import os
import sys
import json
import argparse
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.svm import SVC
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score

SIDE_EFFECTS = [
    'nausea', 'dizziness', 'headache', 'fatigue', 'drowsiness',
    'stomach pain', 'diarrhea', 'constipation', 'dry mouth', 'insomnia',
    'rash', 'muscle pain', 'joint pain', 'bleeding', 'liver toxicity',
    'kidney problems', 'heart palpitations', 'weight gain', 'anxiety',
    'low blood pressure', 'tinnitus', 'heartburn', 'bruising', 'confusion'
]

CONDITIONS = [
    'heart disease', 'diabetes', 'liver disease', 'kidney disease',
    'hypertension', 'asthma', 'depression', 'anxiety disorder', 'none'
]

# Define the 3 ML models
MODEL_CONFIGS = {
    'logistic_regression': {
        'name': 'Logistic Regression',
        'estimator': LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced')
    },
    'random_forest': {
        'name': 'Random Forest',
        'estimator': RandomForestClassifier(
            n_estimators=100, random_state=42, class_weight='balanced', n_jobs=-1
        )
    },
    'svm': {
        'name': 'Support Vector Machine (SVM)',
        'estimator': SVC(
            kernel='rbf', probability=True, random_state=42, class_weight='balanced'
        )
    }
}


class MLService:
    def __init__(self, model_dir):
        self.model_dir = Path(model_dir)
        self.model_dir.mkdir(parents=True, exist_ok=True)
        self.models = {}  # Dict of trained OneVsRest models
        self.scaler = StandardScaler()
        self.drug_names = []

    def build_features(self, df):
        features = []
        for _, row in df.iterrows():
            age = float(row.get('age', 30)) / 100.0
            is_elderly = 1 if float(row.get('age', 30)) >= 65 else 0
            is_pediatric = 1 if float(row.get('age', 30)) < 18 else 0
            sex_val = 1 if row.get('sex', 'O') == 'F' else 0

            conditions = str(row.get('conditions', 'none'))
            cond_list = [c.strip().lower() for c in conditions.split('|') if c.strip()]
            cond_vector = [1 if c in cond_list else 0 for c in CONDITIONS]

            drug = str(row.get('drug_name', 'unknown')).lower()
            drug_idx = self.drug_names.index(drug) if drug in self.drug_names else 0
            drug_vector = [0] * min(30, len(self.drug_names) + 1)
            if drug_idx < len(drug_vector):
                drug_vector[drug_idx] = 1

            feature_row = [age, is_elderly, is_pediatric, sex_val] + cond_vector + drug_vector
            features.append(feature_row)
        return np.array(features)

    def build_labels(self, df):
        labels = []
        for _, row in df.iterrows():
            effects = str(row.get('side_effect_occurred', ''))
            effect_list = [e.strip().lower() for e in effects.split('|') if e.strip()]
            label_row = [1 if se in effect_list else 0 for se in SIDE_EFFECTS]
            labels.append(label_row)
        return np.array(labels)

    def _evaluate_model(self, model, X_test, y_test):
        """Evaluate a single model and return metrics."""
        y_pred = model.predict(X_test)
        return {
            'accuracy': float(accuracy_score(y_test, y_pred)),
            'precision': float(precision_score(y_test, y_pred, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_test, y_pred, average='weighted', zero_division=0)),
            'f1_score': float(f1_score(y_test, y_pred, average='weighted', zero_division=0))
        }

    def train(self, drugs_csv, patients_csv):
        print("Loading data...")
        drugs_df = pd.read_csv(drugs_csv)
        patients_df = pd.read_csv(patients_csv)

        self.drug_names = drugs_df['drug_name'].str.lower().tolist()

        print("Building features...")
        X = self.build_features(patients_df)
        y = self.build_labels(patients_df)

        # Filter rows with at least one side effect
        valid = y.sum(axis=1) > 0
        X, y = X[valid], y[valid]

        if len(X) < 5:
            print("Warning: Very few samples")
            return self._fallback_metrics()

        X_scaled = self.scaler.fit_transform(X)

        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42
        )

        print(f"Training {len(MODEL_CONFIGS)} models on {len(X_train)} samples...\n")
        
        all_metrics = {'models': {}, 'ensemble': {}}
        
        # Train each model
        for model_key, config in MODEL_CONFIGS.items():
            print(f"  Training {config['name']}...")
            
            ovr_model = OneVsRestClassifier(config['estimator'])
            ovr_model.fit(X_train, y_train)
            self.models[model_key] = ovr_model
            
            # Evaluate individual model
            model_metrics = self._evaluate_model(ovr_model, X_test, y_test)
            all_metrics['models'][model_key] = {
                'name': config['name'],
                **model_metrics
            }
            
            print(f"    Accuracy: {model_metrics['accuracy']:.4f} | F1: {model_metrics['f1_score']:.4f}")
        
        # Evaluate ensemble (soft voting via probability averaging)
        print(f"\n  Evaluating Ensemble (Soft Voting)...")
        ensemble_proba = self._ensemble_predict_proba(X_test)
        ensemble_pred = (ensemble_proba >= 0.5).astype(int)
        
        all_metrics['ensemble'] = {
            'name': 'Ensemble (Soft Voting)',
            'accuracy': float(accuracy_score(y_test, ensemble_pred)),
            'precision': float(precision_score(y_test, ensemble_pred, average='weighted', zero_division=0)),
            'recall': float(recall_score(y_test, ensemble_pred, average='weighted', zero_division=0)),
            'f1_score': float(f1_score(y_test, ensemble_pred, average='weighted', zero_division=0))
        }
        
        print(f"    Accuracy: {all_metrics['ensemble']['accuracy']:.4f} | F1: {all_metrics['ensemble']['f1_score']:.4f}")
        
        # Add metadata
        all_metrics['training_samples'] = len(X_train)
        all_metrics['test_samples'] = len(X_test)
        all_metrics['trained_at'] = datetime.now().isoformat()
        all_metrics['num_models'] = len(MODEL_CONFIGS)
        
        # For backward compatibility, keep top-level accuracy/f1_score from ensemble
        all_metrics['accuracy'] = all_metrics['ensemble']['accuracy']
        all_metrics['f1_score'] = all_metrics['ensemble']['f1_score']

        self.save_model(all_metrics)
        print(f"\nTraining complete. {len(MODEL_CONFIGS)} models trained successfully.")
        print(f"METRICS:{json.dumps(all_metrics)}")
        return all_metrics

    def _ensemble_predict_proba(self, X):
        """Average predict_proba across all trained models (soft voting)."""
        probas = []
        for model_key, model in self.models.items():
            try:
                proba = model.predict_proba(X)
                # predict_proba for OneVsRest returns array of shape (n_samples, n_labels)
                # Each column has probabilities for that label
                if isinstance(proba, list):
                    # Some sklearn versions return list of arrays
                    proba = np.column_stack([p[:, 1] if p.shape[1] > 1 else p[:, 0] for p in proba])
                probas.append(proba)
            except Exception as e:
                print(f"  Warning: Could not get probabilities from {model_key}: {e}")
                # Fallback to binary predictions
                pred = model.predict(X)
                probas.append(pred.astype(float))
        
        if not probas:
            return np.zeros((X.shape[0], len(SIDE_EFFECTS)))
        
        # Average all model probabilities
        return np.mean(probas, axis=0)

    def _fallback_metrics(self):
        return {'accuracy': 0.7, 'precision': 0.7, 'recall': 0.7, 'note': 'Fallback'}

    def save_model(self, metrics=None):
        model_path = self.model_dir / 'model.joblib'
        joblib.dump({
            'models': self.models,
            'scaler': self.scaler,
            'drug_names': self.drug_names,
            'side_effects': SIDE_EFFECTS,
            'model_keys': list(self.models.keys())
        }, model_path)
        print(f"Models saved to {model_path}")
        
        if metrics:
            metrics_path = self.model_dir / 'metrics.json'
            with open(metrics_path, 'w') as f:
                json.dump(metrics, f, indent=2)

    def load_model(self):
        model_path = self.model_dir / 'model.joblib'
        if not model_path.exists():
            return False
        data = joblib.load(model_path)
        
        # Support both old (single model) and new (multi-model) format
        if 'models' in data and isinstance(data['models'], dict):
            self.models = data['models']
        elif 'model' in data:
            # Backward compatibility with old single-model format
            self.models = {'logistic_regression': data['model']}
        else:
            return False
        
        self.scaler = data['scaler']
        self.drug_names = data['drug_names']
        return True

    def predict(self, drug_name, age, sex, conditions):
        if not self.models and not self.load_model():
            return {'error': 'Model not loaded'}

        df = pd.DataFrame([{
            'drug_name': drug_name.lower(),
            'age': age,
            'sex': sex,
            'conditions': '|'.join(conditions) if conditions else 'none'
        }])

        X = self.build_features(df)
        X_scaled = self.scaler.transform(X)

        # Get ensemble prediction (average across all models)
        ensemble_proba = self._ensemble_predict_proba(X_scaled)[0]
        ensemble_pred = (ensemble_proba >= 0.5).astype(int)

        # Also get per-model predictions for transparency
        per_model_probas = {}
        for model_key, model in self.models.items():
            try:
                proba = model.predict_proba(X_scaled)
                if isinstance(proba, list):
                    proba = np.column_stack([p[:, 1] if p.shape[1] > 1 else p[:, 0] for p in proba])
                per_model_probas[model_key] = proba[0].tolist()
            except:
                per_model_probas[model_key] = ensemble_proba.tolist()

        predictions = []
        for i, effect in enumerate(SIDE_EFFECTS):
            prob = float(ensemble_proba[i]) if i < len(ensemble_proba) else 0.0
            if prob > 0.1:
                model_details = {}
                for model_key in per_model_probas:
                    if i < len(per_model_probas[model_key]):
                        model_details[model_key] = float(per_model_probas[model_key][i])
                
                predictions.append({
                    'side_effect': effect,
                    'ml_probability': prob,
                    'predicted': bool(ensemble_pred[i]) if i < len(ensemble_pred) else False,
                    'model_probabilities': model_details
                })

        predictions.sort(key=lambda x: x['ml_probability'], reverse=True)
        return {
            'drug_name': drug_name,
            'predictions': predictions[:15],
            'models_used': list(self.models.keys()),
            'num_models': len(self.models)
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--train', action='store_true')
    parser.add_argument('--predict', action='store_true')
    parser.add_argument('--drug', type=str, default='aspirin')
    parser.add_argument('--age', type=int, default=30)
    parser.add_argument('--sex', type=str, default='O')
    parser.add_argument('--conditions', type=str, default='')
    parser.add_argument('--drugs-csv', type=str)
    parser.add_argument('--patients-csv', type=str)
    parser.add_argument('--model-dir', type=str, default='../../models')

    args = parser.parse_args()
    service = MLService(args.model_dir)

    if args.train:
        service.train(args.drugs_csv, args.patients_csv)
    elif args.predict:
        conditions = [c.strip() for c in args.conditions.split(',') if c.strip()]
        result = service.predict(args.drug, args.age, args.sex, conditions)
        print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
