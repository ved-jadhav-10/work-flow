# ML Project — Work-Flow Usage Guide

A step-by-step guide for using Work-Flow with a Machine Learning project, covering document ingestion, code review automation, and RAG-powered cross-referencing.

---

## 1. Project Setup

Create a new project with context that reflects your ML work:

| Field           | Example value                                                                 |
| --------------- | ----------------------------------------------------------------------------- |
| **Name**        | `ML Model Review`                                                             |
| **Goal**        | `Implement and validate a supervised learning pipeline for classification`    |
| **Constraints** | `Python`, `scikit-learn or PyTorch`, `No data leakage`, `Reproducible splits` |

---

## 2. EasyLearn — Document Ingestion

Upload your ML PDF (research paper, textbook chapter, or methodology doc) here.

After upload, run:

- **Extract Concepts** — pulls key topics (e.g. "gradient descent", "cross-validation", "regularisation") into the project context
- **Summarise** — generates a plain-language summary stored in the RAG index

**Good PDF candidates:**

- A research paper introducing the algorithm you are implementing (e.g. "Attention is All You Need", an XGBoost paper, a ResNet paper)
- A textbook chapter on model evaluation or feature engineering
- An internal methodology doc describing your data pipeline

---

## 3. EasyCode — Code Review Automation

All three tools take the same two inputs:

| Field      | Value                                                             |
| ---------- | ----------------------------------------------------------------- |
| `code`     | Paste your Python/script as plain text (up to ~10,000 characters) |
| `language` | `python` (or `jupyter`, `bash`, etc.)                             |

### 3a. Explain

Use this on your **model training pipeline** — e.g. a `train.py`, a PyTorch `Trainer` class, or a `sklearn` `Pipeline` definition.

**What you get back:**

- High-level overview of what the code does
- List of components and their purpose
- Design patterns identified
- Complexity rating
- Improvement suggestions

**Example code to paste:**

```python
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

pipe = Pipeline([
    ("scaler", StandardScaler()),
    ("clf", RandomForestClassifier(n_estimators=100, random_state=42)),
])
pipe.fit(X_train, y_train)
print(pipe.score(X_test, y_test))
```

---

### 3b. Debug

Use this on code where you **suspect a problem** — data leakage, shape mismatches, wrong metric, leaky preprocessing.

**What you get back:**

- Bugs with severity: `critical` / `warning` / `info`
- Line hint pointing to the problem
- Proposed fix for each bug

**Example problematic code to paste (data leakage):**

```python
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)  # fitted on full dataset before split — leakage!

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2)

model = LogisticRegression()
model.fit(X_train, y_train)
```

---

### 3c. README

Use this on your **full training script or model class** to auto-generate documentation.

Optionally set `project_name` (e.g. `"ML Model Review"`) for a personalised header.

---

## 4. EasyAutomate — Task Extraction from Emails and Meeting Notes

Paste any unstructured text that contains action items — meeting transcripts, email threads, Slack exports, experiment logs, or project notes.

| Field           | Value                                                     |
| --------------- | --------------------------------------------------------- |
| **Input text**  | Raw email, meeting notes, or experiment log as plain text |
| **Source type** | `email`, `transcript`, `notes`, or leave as default       |

**What you get back:**

- A list of tasks with titles, descriptions, and priority levels (`high` / `medium` / `low`)
- Tasks are stored in the project and counted on the dashboard
- High-priority tasks are surfaced separately on the project card

**ML-specific examples of text to paste:**

_Email thread example:_

```
Hi team,

Following up from today's sync. We need to:
- Retrain the classifier with the new dataset by Friday (blocking deployment)
- Fix the preprocessing bug where test data is being normalised with training stats
- Write evaluation script for F1 and AUC metrics
- Update the README with the new hyperparameter grid

Let me know if anything is unclear.
```

_Meeting transcript example:_

```
Host: Okay so the model is overfitting badly on the validation set.
Dev: We should add dropout layers before the final dense layer.
Host: Agreed, make that high priority. Also we still haven't benchmarked against the baseline.
Dev: I'll do that this week. And we need to add cross-validation to the eval pipeline.
Host: Yes, log it. Also — the GPU quota runs out on the 15th, someone needs to request an extension.
```

After extraction, review and adjust task priorities in the task board before moving on.

---

## 5. Context Chat — RAG Prompt

After completing steps 2, 3, and 4, open **Context Chat** and send this prompt:

---

> I've uploaded an ML paper/document to this project and also submitted my training code for analysis. Based on the concepts extracted from the document and the code insights stored in this project, please do the following:
>
> 1. Identify which ML techniques or algorithms mentioned in the document are present (or missing) in my code.
> 2. Flag any implementation patterns in my code that contradict best practices described in the document.
> 3. Suggest specific improvements to my code that are grounded in the theory from the uploaded PDF.
> 4. Highlight any risks — such as data leakage, incorrect loss functions, or wrong normalisation — that are relevant given the document's recommendations.

---

This forces the RAG engine to retrieve from both the **document embeddings** (your PDF) and the **code insight embeddings** (your EasyCode runs) and cross-reference them in its answer.

---

## 6. Recommended Workflow Order

```
1. Create project (with constraints)
       ↓
2. EasyLearn → Upload PDF → Extract Concepts
       ↓
3. EasyCode → Explain (training pipeline)
4. EasyCode → Debug (preprocessing / leakage-prone sections)
       ↓
5. EasyAutomate → paste email or meeting notes → review extracted tasks
       ↓
6. Context Chat → paste the RAG prompt above
```

Following this order ensures the RAG index is populated with document theory, code insights, and task context before you query it.
