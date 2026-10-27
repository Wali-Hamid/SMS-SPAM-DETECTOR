# SMS Spam Detector

SMS Spam Detector is a Python mini project that classifies an SMS as **Spam** or **Normal (ham)**.
A scikit-learn model is trained on the UCI SMS Spam Collection and saved with joblib. A Flask backend loads the saved model and returns predictions. Every message and its prediction is stored in MySQL, and a React (Vite) interface shows the result and the history.

> The model uses only the text of the message, so its result is not guaranteed to be correct.

## Features

- Classifies an SMS as Spam or Normal (ham)
- Saves every message and prediction in a MySQL database
- Shows the prediction result and the saved history in the React interface
- The model is trained once with `train_model.py` and is **not** retrained on every prediction

## Tech Stack

| Part | Technology |
|------|------------|
| Machine learning | scikit-learn (`TfidfVectorizer` + `MultinomialNB` in one `Pipeline`), joblib |
| Backend | Python, Flask |
| Database | MySQL (database `spam_detector`, table `predictions`) |
| Frontend | React with Vite |
| Dataset | UCI SMS Spam Collection (`sms_data.tsv`) |

## How It Works

1. The user types a message in the React interface.
2. React sends the message to the Flask API (`/api/predict`).
3. Flask predicts spam or ham using the saved model (`spam_model.joblib`).
4. The message and its prediction are saved in the MySQL `predictions` table.
5. The result and the history (`/api/history`) are shown in React.

## Model Details

- **Dataset:** UCI SMS Spam Collection, file `sms_data.tsv`. Labels are `spam` and `ham` (`ham` means a normal SMS).
- **Model:** `Pipeline` of `TfidfVectorizer` and `MultinomialNB`.
- **Split:** 80% training and 20% testing, with `random_state=42` and `stratify=y`.
- **Evaluation:** `accuracy_score` and `classification_report`.

Result from my training run on 5,572 messages (4,457 training and 1,115 testing):

| Class | Precision | Recall | F1-score | Support |
|-------|-----------|--------|----------|---------|
| ham   | 0.96 | 1.00 | 0.98 | 966 |
| spam  | 1.00 | 0.70 | 0.83 | 149 |

**Accuracy: 96.05%.** The spam recall is 0.70, which means some spam messages are still predicted as normal.

## Project Structure

```
spam-detector/
├── backend/
│   ├── app.py              # Flask API
│   ├── train_model.py      # trains and saves the model
│   ├── sms_data.tsv        # dataset
│   ├── spam_model.joblib   # saved model (created by train_model.py)
│   └── .env                # your private settings (not pushed to GitHub)
└── frontend/               # React + Vite app
```

Adjust this tree if your folders are different.

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/YOUR-REPO-NAME.git
cd YOUR-REPO-NAME
```

### 2. Create the MySQL database and table

Run this in MySQL (for example in MySQL Workbench). The column types below are an example; use the same types as in your own table.

```sql
CREATE DATABASE IF NOT EXISTS spam_detector;
USE spam_detector;

CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    message TEXT NOT NULL,
    prediction VARCHAR(10) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Backend setup

```bash
cd backend
pip install flask scikit-learn joblib mysql-connector-python python-dotenv
```

Also install any other library your code imports (for example `pandas` or `flask-cors`).

Create a `.env` file in the `backend` folder. You can copy `.env.example` and put your own values:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password_here
DB_NAME=spam_detector
```

Never push `.env` to GitHub. It is listed in `.gitignore`.

### 4. Train the model

```bash
python train_model.py
```

This trains the model, prints the accuracy and the classification report, and saves `spam_model.joblib`.

### 5. Run the backend

```bash
python app.py
```

Flask loads the saved model when it starts. If you train the model again, start Flask again.

### 6. Run the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the link shown in the terminal (usually `http://localhost:5173`).

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/predict` | Receives a message, predicts spam or ham, saves it in MySQL and returns the result |
| `/api/history` | Returns the saved predictions |

## Limitations

- The model predicts only from the text of the message. It does not use the sender, time or other information.
- The result is not guaranteed. A spam message may be predicted as normal and a normal message may be predicted as spam.
- The model is trained only on the UCI SMS Spam Collection.
- This is an academic mini project and is not a production-ready spam filter.

## Future Improvements

- Compare other classifiers and tune the TF-IDF settings
- Let users correct wrong predictions and retrain with that feedback
- Add user login, input validation and HTTPS
- Add search and pagination for the history
- Add automated tests

## Dataset Credit

Almeida, T. A., Gómez Hidalgo, J. M. and Yamakami, A. (2011). *Contributions to the study of SMS spam filtering: new collection and results.* Proceedings of the 11th ACM Symposium on Document Engineering (DocEng '11), pp. 259–262.
