import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report

# Dataset load krte h: pehla column label, doosra message
data = pd.read_csv(
    "sms_data.tsv",
    sep="\t",
    header=None,
    names=["label", "message"],
    encoding="utf-8"
)

# ham = normal message; spam = spam message
X = data["message"]
y = data["label"]

# Dataset ko training aur testing parts mein baanto
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# Text ko numbers mein badlte hai, phir ML model train krte h
model = Pipeline([
    ("text_to_numbers", TfidfVectorizer()),
    ("classifier", MultinomialNB())
])

model.fit(X_train, y_train)   #training data par model train krta hai 

# Alag rakhe testing data par model check krte h
predictions = model.predict(X_test)   #naye message ka label predict krta hai

print(f"Total messages: {len(data)}")
print(f"Training messages: {len(X_train)}")
print(f"Testing messages: {len(X_test)}")
print(f"Accuracy: {accuracy_score(y_test, predictions):.2%}")
print("\nReport:")
print(classification_report(y_test, predictions))

# Trained model ko file mein save krte hai
joblib.dump(model, "spam_model.joblib")
print("\nTrained model saved as spam_model.joblib")