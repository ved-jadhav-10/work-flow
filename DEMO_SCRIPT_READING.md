# Workflow — Reading Script

---

Every AI tool today has the same problem. You spend an hour explaining your project — the tech stack, the constraints, the decisions you've already made — and the moment you close the tab, it's gone.

You switch tools. You start a new chat. You repeat yourself. Again.

That's not a productivity tool. That's a memory hole.

We built Workflow to fix that.

---

Workflow is a persistent AI context layer. Everything you feed it — research papers, code, meeting notes — gets stored and indexed so every part of the platform can search through it and use it when answering your questions.

Your project remembers. The AI never starts from zero.

---

Every project starts with a goal and a set of constraints. These aren't just labels — Workflow actively checks every AI response against them and flags anything that goes against what you defined. Think of it as guardrails that keep the AI focused on your actual project.

For this demo we're building an ML classification pipeline. Python only, scikit-learn, no data leakage, reproducible splits.

---

First stop: the Learning module. We upload a machine learning research paper. Workflow reads the full document, breaks it into pieces, and builds a searchable knowledge base from it.

Then we run concept extraction. The system pulls out the key topics from the paper and stores them. These are now part of the project's memory. Any question asked later can pull from them.

---

Now the Developer module. We paste in a preprocessing script that has a known issue.

Watch what happens.

Workflow catches it. It flags the problem, points to the relevant lines, and suggests a fix. That analysis is now saved to the project too, so the AI will remember it.

---

Here's an email thread from a team sync — issues raised, fixes agreed, work assigned, all buried in plain text.

We paste it in. Workflow reads it.

Tasks automatically pulled out, each with a priority level. Everything that was buried in that thread is now captured and ready to track.

---

This is where it all comes together. We ask the chat a question that cuts across everything — the paper, the code analysis, the project rules. Workflow searches through everything it's stored and builds an answer from what's actually relevant.

It's not guessing. It's pulling from this project's own knowledge.

Notice the source citations at the bottom — it shows exactly what it read to give that answer.

This is what it looks like when an AI actually understands your project.

---

One more thing. Not everyone wants their code or research going to an external server. Workflow supports fully local AI through Ollama. Flip the inference switch and every feature — chat, code analysis, everything — runs on your own machine. Nothing leaves. No API keys, no usage limits, no data sent anywhere.

Full capability, complete privacy.

---

Workflow. One system for your documents, your code, your tasks, and your AI — all connected, all persistent, all yours.

Where ideas bloom under starlight.
