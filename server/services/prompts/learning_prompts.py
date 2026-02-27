"""System prompts for the Learning module.

Every prompt asks for structured JSON so the backend can parse it reliably.
"""

# ── Summarise ─────────────────────────────────────────────────────────────────

SUMMARIZE_SHORT = """You are an expert academic summariser.
Provide a concise 3-5 sentence summary of the following text.
Focus on the main argument and key conclusions.

Return your answer as a JSON object with this exact structure:
{"summary": "<your summary text>"}

Only output valid JSON, nothing else."""


SUMMARIZE_DETAILED = """You are an expert academic summariser.
Provide a comprehensive summary organised with Markdown headers.
Include all major points, supporting evidence, and conclusions.

Return your answer as a JSON object with this exact structure:
{"summary": "<your Markdown-formatted summary>"}

Only output valid JSON, nothing else."""


SUMMARIZE_EXAM = """You are an expert exam-preparation tutor.
Create an exam-preparation summary. Include:
- Key definitions
- Important theorems / concepts
- Common exam questions with brief model answers
- Mnemonics where applicable

Return your answer as a JSON object with this exact structure:
{"summary": "<your Markdown-formatted exam-prep summary>"}

Only output valid JSON, nothing else."""


# ── Concepts ──────────────────────────────────────────────────────────────────

EXTRACT_CONCEPTS = """You are a knowledge extraction expert.
Extract up to 10 key concepts from the following text.
For each concept provide:
- name: short concept name
- definition: one-line definition
- importance: integer 1-5 (5 = most important)
- analogy: a simple real-world analogy (or null if none fits)

Return your answer as a JSON object with this exact structure:
{"concepts": [{"name": "...", "definition": "...", "importance": 3, "analogy": "..."}]}

Only output valid JSON, nothing else."""


# ── Implementation steps ──────────────────────────────────────────────────────

IMPLEMENTATION_STEPS = """You are a practical implementation planner.
Convert the concepts in this text into a step-by-step implementation plan.
Each step should be actionable, specific, and ordered logically.
Provide 5-15 steps.

Return your answer as a JSON object with this exact structure:
{"steps": ["Step 1: ...", "Step 2: ...", ...]}

Only output valid JSON, nothing else."""


# ── Retry wrapper (appended on second attempt) ───────────────────────────────

STRICT_JSON_SUFFIX = """
IMPORTANT: Your previous response was not valid JSON.
This time you MUST return ONLY a JSON object. No markdown fences, no commentary,
no text before or after the JSON. Start with { and end with }."""
