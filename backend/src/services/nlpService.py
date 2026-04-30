#!/usr/bin/env python3
"""
NLP Service for Drug Side Effect Extraction
Uses TF-IDF for text similarity.
DISCLAIMER: For demonstration purposes only — not medical advice.
"""

import os
import json
import argparse
from pathlib import Path

import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import joblib


class NLPService:
    def __init__(self, model_dir):
        self.model_dir = Path(model_dir)
        self.vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
        self.drug_vectors = None
        self.drug_data = {}

    def build_corpus(self, drugs_df):
        """Build TF-IDF corpus from drug descriptions."""
        corpus = []
        for _, row in drugs_df.iterrows():
            name = row['drug_name']
            desc = str(row.get('description', ''))
            effects = str(row.get('side_effects_list', '')).replace('|', ' ').replace(':', ' ')
            text = f"{name} {desc} {effects}"
            corpus.append(text)
            self.drug_data[name.lower()] = {
                'name': name,
                'description': desc,
                'side_effects': row.get('side_effects_list', '')
            }

        self.drug_vectors = self.vectorizer.fit_transform(corpus)
        self.save()
        return True

    def save(self):
        path = self.model_dir / 'nlp_model.joblib'
        joblib.dump({
            'vectorizer': self.vectorizer,
            'drug_vectors': self.drug_vectors,
            'drug_data': self.drug_data
        }, path)

    def load(self):
        path = self.model_dir / 'nlp_model.joblib'
        if not path.exists():
            return False
        data = joblib.load(path)
        self.vectorizer = data['vectorizer']
        self.drug_vectors = data['drug_vectors']
        self.drug_data = data['drug_data']
        return True

    def get_side_effect_relevance(self, drug_name):
        """Get side effect relevance scores for a drug."""
        if self.drug_vectors is None and not self.load():
            return {}

        drug_lower = drug_name.lower()
        if drug_lower in self.drug_data:
            data = self.drug_data[drug_lower]
            effects = {}
            for item in data['side_effects'].split('|'):
                parts = item.split(':')
                name = parts[0] if parts else item
                freq = parts[1] if len(parts) > 1 else 'common'
                freq_scores = {'very_common': 0.9, 'common': 0.7, 'uncommon': 0.4, 'rare': 0.2}
                effects[name] = freq_scores.get(freq, 0.5)
            return effects
        return {}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--build', action='store_true')
    parser.add_argument('--query', type=str)
    parser.add_argument('--drugs-csv', type=str)
    parser.add_argument('--model-dir', type=str, default='../../models')

    args = parser.parse_args()
    service = NLPService(args.model_dir)

    if args.build and args.drugs_csv:
        df = pd.read_csv(args.drugs_csv)
        service.build_corpus(df)
        print("NLP corpus built successfully")
    elif args.query:
        relevance = service.get_side_effect_relevance(args.query)
        print(json.dumps(relevance, indent=2))


if __name__ == '__main__':
    main()


