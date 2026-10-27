import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://127.0.0.1:5000/api";

const SAMPLES = [
  "Congratulations! You won a free iPhone. Click the link to claim now.",
  "Hey, are we still meeting at 6 for dinner?",
];

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l8 3v6c0 4.5-3.2 8-8 9-4.8-1-8-4.5-8-9V6l8-3z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function VerdictIcon({ spam }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {spam ? (
        <>
          <path d="M12 4l9 16H3L12 4z" />
          <path d="M12 10v4M12 17.5v.01" />
        </>
      ) : (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M8 12.5l3 3 5-6" />
        </>
      )}
    </svg>
  );
}

function App() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadHistory() {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) throw new Error("History load nahi hui");
    setHistory(await response.json());
  }

  useEffect(() => {
    loadHistory().catch(() =>
      setError("History load nahi hui. Flask backend chalu hai?")
    );
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setResult("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Prediction nahi hui");

      setResult(data.prediction);
      setMessage("");
      await loadHistory();
    } catch (err) {
      setError(err.message || "Backend se connect nahi ho paya");
    } finally {
      setLoading(false);
    }
  }

  const isSpam = result === "Spam";
  const spamCount = history.filter((item) => item.prediction === "Spam").length;
  const normalCount = history.length - spamCount;

  return (
    <main className="page">
      <section className="card">
        <header className="brand">
          <div className="brand-icon">
            <ShieldIcon />
          </div>
          <div>
            <h1>SMS Spam Detector</h1>
            <p className="intro">
              Paste a message and the ML model will tell you if it is spam or normal.
            </p>
          </div>
        </header>

        <form onSubmit={handleSubmit}>
          <label htmlFor="message">Your message</label>
          <textarea
            id="message"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Paste or type the SMS here"
            required
          />

          <div className="form-footer">
            <div className="samples">
              {SAMPLES.map((text, i) => (
                <button
                  key={i}
                  type="button"
                  className="chip"
                  onClick={() => setMessage(text)}
                >
                  Try sample {i + 1}
                </button>
              ))}
            </div>
            <span className="counter">{message.length} characters</span>
          </div>

          <button className="primary" disabled={loading || !message.trim()}>
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? "Checking..." : "Check message"}
          </button>
        </form>

        {result && (
          <div className={`result ${isSpam ? "spam" : "normal"}`} role="status">
            <VerdictIcon spam={isSpam} />
            <div>
              <strong>{isSpam ? "Spam" : "Normal message"}</strong>
              <p>
                {isSpam
                  ? "This looks like spam. Don't click links or share personal details."
                  : "This looks like a regular message."}
              </p>
            </div>
          </div>
        )}

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="history-head">
          <h2>Recent predictions</h2>
          {history.length > 0 && (
            <div className="stats">
              <span className="stat spam">{spamCount} spam</span>
              <span className="stat normal">{normalCount} normal</span>
            </div>
          )}
        </div>

        {history.length === 0 ? (
          <p className="empty">No predictions yet. Check a message to see it here.</p>
        ) : (
          <ul className="history">
            {history.map((item) => (
              <li key={item.id}>
                <span className="msg">{item.message}</span>
                <strong className={item.prediction === "Spam" ? "spam" : "normal"}>
                  {item.prediction}
                </strong>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="footer">
        <p>Trained by Wali Hamid</p>
      </footer>
    </main>
  );
}

export default App;