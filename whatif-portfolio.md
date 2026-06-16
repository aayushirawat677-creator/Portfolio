# What If? — AI Decision Exploration Game
## Portfolio Case Study Document
### For Claude Design — matching MISO/Lumi style

---

## PAGE METADATA
- Title: What If? — Multi-Agent Decision Exploration Game · Aayushi
- Meta description: What If? is a multi-agent AI game built on Azure AI Foundry that shows both sides of any life decision — without ever giving advice. A deep dive into its 3-agent pipeline, context-gathering loop, safety guardrails, and evaluation framework.
- Tag: AI Product · Hackathon · Live
- Back link: ← AI Products

---

## HERO

# What If? — a multi-agent decision exploration game.

Not an advice tool — a possibility engine. Ask any question, get both honest futures, explore each timeline card by card. Never told what to do.

**4** Azure AI Foundry agents
**3** pipeline stages
**10** eval test cases
**0** pieces of advice given

---

## METRICS / STATS BAR

- Built in: 1 session
- Stack: Next.js + Azure AI Foundry
- Model: gpt-4.1-mini
- Live at: whatif-pearl.vercel.app
- Submitted: Microsoft Agents League 2026

---

## 01 · Intro

### The problem with AI decision tools.

Every AI tool that touches decisions falls into the same trap: it gives advice. "You should do X." "Option B is better for you." "I recommend..."

That's the wrong model. The user knows their life better than any AI. What they need is clarity — a way to see both sides of a choice without someone else deciding for them.

What If? is built on one principle: **show what could happen, never what to do.**

The user types a question or statement. A 3-agent Azure AI Foundry pipeline classifies the decision, gathers targeted context, and generates two honest what-if timelines. No recommendation. No judgment. Just possibilities.

---

## 02 · Who It's For

### Anyone standing at a crossroads.

// primary
**Life decision-makers**
People facing real decisions — career moves, housing, relationships, daily choices — who want to think clearly without being told what to do.

// secondary
**Overthinkers**
People who get stuck in their own heads and need to externalize both paths to move forward.

// secondary
**The curious**
People who want to explore "what if" scenarios not because they're paralyzed, but because they're genuinely curious about both futures.

---

## 03 · Query Modes

### Three ways a decision can be framed.

The Baseline Classifier (Agent 1) identifies which mode the user's input belongs to — and this determines everything downstream: path labels, polarity, output shape, and what context to gather.

// mode 01
**binary_decision**
A yes/no gate fits the question.
Example: "Should I quit my job to start a company?"
Paths: yes / no
Polarity: Agent assigns positive/negative per path

// mode 02
**option_compare**
User presents two specific options.
Example: "MacBook or Windows laptop?"
Paths: option_a / option_b
Polarity: none — purely factual, no value judgment

// mode 03
**statement_assessment**
User states a fact, implying an implicit decision.
Example: "I am 100kg."
Agent infers: "Do you want to lose weight?"
Paths: yes (act) / no (don't act)
Polarity: Agent assigns per path

---

## 04 · AI Architecture

### A 3-agent pipeline on Azure AI Foundry.

```
User input
    ↓
Code Guardrails (instant, pre-agent safety layer)
    ↓
Agent 1: Parser-agent1 — Baseline Classifier
    ↓
Agent 2: retriever-agent2 — Context Gatherer
    ↓
Agent 3: Timeline-agent3 — What-If Generator
    ↓
Frontend: Swipeable timeline cards
```

All agents run on **gpt-4.1-mini** via Azure AI Foundry. The pipeline is orchestrated from the Next.js API layer — agents are called sequentially, with context passed between each stage.

---

## 05 · Agent 1 — Baseline Classifier

### Turning a messy question into a structured decision.

**Agent name in Foundry:** Parser-agent1
**Model:** gpt-4.1-mini

The Classifier is the entry point for every query. Its job is to understand what kind of decision the user is really facing — and set up the entire downstream pipeline correctly.

**Output fields:**

- `query_mode` — binary_decision / option_compare / statement_assessment
- `time_impact` — short (hours/days) or long (weeks+)
- `baseline_summary` — one sentence: who they are and what they're really deciding
- `baseline_question` — the gate question to ask if needs_gate_answer is true
- `polarity_applies` — true for binary decisions, false for option compare
- `paths` — specific labels for each path (yes/no or option_a/option_b)
- `required_context` — checklist of what Agent 2 needs to collect for each path
- `needs_gate_answer` — whether to ask the baseline question before gathering
- `safety_flag` — null / medical / self_harm / harmful_drug
- `safe` — boolean

**Key design decision — polarity:**
The Classifier, not the user, decides which path is positive and which is negative. "Should I skip my workout?" → yes=negative, no=positive. The AI understands the goal direction.

**Key design decision — required_context:**
The Classifier pre-defines exactly what context Agent 2 needs to collect for each path. This prevents the Gatherer from asking irrelevant questions.

```json
// Example output — "Should I take this 3rd floor flat without a lift?"
{
  "query_mode": "binary_decision",
  "time_impact": "long",
  "polarity_applies": true,
  "paths": {
    "yes": { "label": "Take the 3rd-floor flat", "polarity": "positive" },
    "no":  { "label": "Pass and keep looking", "polarity": "negative" }
  },
  "required_context": {
    "yes_path": ["rent", "commute_distance", "mobility_concerns"],
    "no_path": ["move_urgency", "alternative_options", "current_housing"],
    "shared": []
  },
  "needs_gate_answer": true,
  "safety_flag": null,
  "safe": true
}
```

---

## 06 · Agent 2 — Context Gatherer

### One question at a time. Both paths. Maximum 3.

**Agent name in Foundry:** retriever-agent2
**Model:** gpt-4.1-mini

The Gatherer's job is to fill in the context checklist from Agent 1 — without interrogating the user. It reads the conversation history, the baseline JSON, and the collected context so far, then decides: what's the single most important thing still missing?

**Rules:**
- Ask ONE question per turn — game feel, not a form
- Fill context for BOTH paths before marking ready_to_generate: true
- Prioritize shared context questions (help all paths at once)
- Never ask more than 3 questions total
- After 3 questions, generate regardless of missing fields
- Never ask for age (handled by code guardrails layer)
- Never give advice, never generate what-ifs

**Output fields:**

- `ready_to_generate` — boolean
- `next_question` — { target_path, question, field_being_collected }
- `collected_context` — { yes_path: {}, no_path: {}, option_a: {}, option_b: {}, shared: {} }
- `missing_fields` — what's still needed per path
- `needs_tool` — null or "weather" (for outfit/dress queries)

```json
// Example — after user answers "How urgent is your move?"
{
  "ready_to_generate": false,
  "next_question": {
    "target_path": "yes",
    "question": "Any mobility concerns — do you or anyone in the household find stairs difficult?",
    "field_being_collected": "mobility_concerns"
  },
  "collected_context": {
    "no_path": { "move_urgency": "medium" },
    "yes_path": {},
    "shared": {}
  }
}
```

**Key design decision — alternating paths:**
The Gatherer alternates between collecting context for yes_path and no_path. The user's gate answer (yes/no) doesn't skip context collection for the other path — both futures need grounding.

---

## 07 · Agent 3 — What-If Generator

### Two honest futures. No utopia. No doom.

**Agent name in Foundry:** Timeline-agent3
**Model:** gpt-4.1-mini

The Generator is the creative core of the pipeline. It receives the baseline classification, the collected context, and the full conversation history — then writes vivid, specific, causally connected timelines for each path.

**Output shape depends on time_impact:**

| query_mode | time_impact | Output per path |
|---|---|---|
| binary_decision / statement_assessment | short | what_if: single paragraph + polarity |
| binary_decision / statement_assessment | long | impacts: short_term + medium_term + long_term + polarity |
| option_compare | short | what_if: single paragraph, no polarity |
| option_compare | long | impacts: three time buckets, no polarity |

**Time buckets for long queries:**
- short_term: weeks 1-4 (25-40 words)
- medium_term: 3-6 months (25-40 words)
- long_term: 1-3 years (25-40 words)

**Shared rules for all scenarios:**
- Second person ("you") — specific to what the user told us
- Every path includes at least one realistic obstacle or friction
- No utopian outcomes ("everything works out perfectly")
- No doom scenarios ("everything falls apart")
- Never gives advice or implies one path is better
- Checkpoint 2 must causally follow checkpoint 1; checkpoint 3 from checkpoint 2

```json
// Example output — "Red or white dress tonight?" (option_compare, short)
{
  "time_impact": "short",
  "polarity_applies": false,
  "scenarios": [
    {
      "path": "option_a",
      "label": "Red dress tonight",
      "what_if": "Red reads as bold and energetic indoors under warm restaurant lighting. You stand out in the room — which works if you want to be noticed, feels like a lot if you'd rather blend. The colour photographs strongly but can wash out under certain overhead lights."
    },
    {
      "path": "option_b",
      "label": "White dress tonight",
      "what_if": "White looks crisp and clean indoors. On the rainy walk afterward, hem and shoes pick up street splash marks fast — by the time you reach the bar, you'll notice specks and damp edges that red would have hidden."
    }
  ],
  "context_note": "Both read well indoors — the difference shows most in the walk between venues."
}
```

---

## 08 · Output → UI

### From JSON to swipeable cards.

The frontend parses the Generator output and maps it to a card-based UI:

**Results screen:**
- Two side-by-side summary cards (one per path)
- Each card shows: path label, summary, polarity badge
- Preview snippet of the first timeline detail
- "Read timeline →" button

**Timeline overlay (on tap):**
- Card 1: Overview (summary + polarity)
- Card 2: Short term / "What happens" (for short queries)
- Card 3: Medium term (for long queries)
- Card 4: Long term (for long queries)
- Swipe left/right, tap dots, or use arrow keys
- Cards loop back to Card 1 after the last

**Polarity badges:**
- ↑ likely positive (sage green)
- ↓ likely challenging (soft terracotta)
- Option compare: no badge — both paths shown neutrally

---

## 09 · Safety & Guardrails

### Three layers. The first one never reaches an agent.

**Layer 1 — Code guardrails (runs before any agent, <1ms)**

| Input | Response |
|---|---|
| Self-harm / suicide | 💙 988 Lifeline + Crisis Text Line |
| Harm to others / murder | 🚨 Emergency services + legal warning |
| Hard drugs (heroin, cocaine, meth, fentanyl) | ⚠️ SAMHSA 1-800-662-4357 |
| Toxic substances (bleach, poison) | 🏥 Poison Control 1-800-222-1222 |
| Medical decisions (stop medication) | Doctor required |
| Illegal activities | Legal consequences only, no encouragement |

Design principle: safety checks run in code, not in agents. Code is deterministic. Agents can be jailbroken. A pattern match is faster and more reliable than an LLM judgment for hard stops.

**Layer 2 — Age gate (alcohol & tobacco)**

- Alcohol: legal age 21 (US). Under 21 → polite redirect with humor ("Your liver will thank you later — raise a glass of OJ 🍊")
- Smoking / cannabis: legal age 18. Under 18 → health redirect
- Legal age confirmed → disclaimer popup (user acknowledges, app cannot verify) → proceed with honest what-ifs
- Age stored as collected context so Gatherer never re-asks

**Layer 3 — Agent prompt rules**
- Hard rule: never say "you should", "you must", "I recommend", "the best option"
- Hard rule: every scenario must include at least one friction point
- Hard rule: polarity describes trajectory tone, not a judgment of the person
- Hard rule: option compare never uses polarity — purely factual

---

## 10 · Evaluation Framework

### Agent 4 — EvalJudge-agent5 (Azure AI Foundry)

**Agent name in Foundry:** EvalJudge-agent5
**Model:** gpt-4.1-mini

A dedicated evaluation agent that scores pipeline output across 7 dimensions:

1. **STRUCTURAL** — does output match the required JSON schema exactly?
2. **ACCURACY** — correct query_mode, time_impact, polarity_applies?
3. **QUALITY** — specific, realistic, non-generic?
4. **SAFETY** — correct handling of dangerous inputs?
5. **NO_ADVICE** — avoids "you should", "I recommend", "the best option"?
6. **FRICTION** — at least one realistic obstacle in every scenario?
7. **DIVERSITY** — are the two paths genuinely different from each other?

Returns: scores 0-10 per dimension, overall score, passed: true/false, issues list, one-sentence verdict.

**Azure AI Foundry Eval run (eval-1):**
10 test cases × 3 pipeline agents = 30 evaluation runs

Test cases cover:
- Binary decisions: gym today, quit job, take flat, break up, move to NYC
- Option compare: dress colour, MacBook vs Windows, pasta vs salad, stocks vs real estate
- Statement assessment: 100kg weight loss

Evaluators: TaskCompletion, TaskAdherence, CustomerSatisfaction, Groundedness, Coherence

---

## 11 · Product Principles

### Five rules the entire system is built around.

✓ **Show possibilities, never advice** — the user decides, always. The AI's job is clarity, not direction.

✓ **Honest over optimistic** — every path includes realistic friction. No path is sold as the obvious right choice.

✓ **Minimum viable questions** — max 3 follow-ups before generating. The user came for answers, not a survey.

✓ **Safety first, always in code** — guardrails run before any agent call. Deterministic checks for hard stops.

✓ **Specific over generic** — timelines must reflect the user's actual situation. "You start the gym and feel better" is failure. "By week 3 your lower back pain eases and Monday mornings stop feeling heavy" is the target.

---

## 12 · Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Animations | Framer Motion |
| Background | SVG landscape (scales without pixelation) |
| AI Agents | Azure AI Foundry — gpt-4.1-mini |
| Evaluation | Azure AI Foundry Evaluation (eval-1) |
| Deployment | Vercel |
| Dev assistance | GitHub Copilot |

---

## 13 · Links

- **Live app:** https://whatif-pearl.vercel.app/
- **GitHub:** https://github.com/aayushirawat677-creator/Whatif
- **Submitted to:** Microsoft Agents League Hackathon 2026

---

## CARD FOR PROJECTS.HTML (add after MISO card)

W · What If? Game
Hackathon · Live · Microsoft Agents League 2026
A multi-agent AI game that explores both sides of any life decision — without ever giving advice. 3-agent Azure AI Foundry pipeline: classifier → context gatherer → what-if generator.
Tags: Azure AI Foundry · gpt-4.1-mini · Multi-agent · Guardrails · Eval
Read the breakdown →  (link to whatif.html)

