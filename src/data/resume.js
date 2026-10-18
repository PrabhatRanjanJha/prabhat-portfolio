// The text of the résumé shown on the unrolling manuscript. Keep it in sync with public/resume.pdf.

export const resume = {
  name: 'Prabhat Ranjan Jha',
  place: 'Bengaluru, India',
  email: 'prabhatjha2022@gmail.com',
  links: [
    { label: 'linkedin.com/in/prabhat-ranjan-jha', href: 'https://www.linkedin.com/in/prabhat-ranjan-jha/' },
    { label: 'github.com/PrabhatRanjanJha', href: 'https://github.com/PrabhatRanjanJha' },
    { label: 'prabhat-portfolio-plum.vercel.app', href: 'https://prabhat-portfolio-plum.vercel.app/' },
  ],
  education: [
    { what: 'Scaler School of Technology', detail: 'B.Tech, Computer Science', when: '2025 – 2029' },
    { what: 'Indian Institute of Technology, Madras', detail: 'B.S. Data Science & Applications (Online)', when: '2025 – 2029' },
    { what: 'Shiv Vani Model Senior Secondary School', detail: 'HSC (87.4%)', when: '2024' },
  ],
  experience: [
    {
      what: 'Web Development Teaching Assistant',
      where: 'Scaler School of Technology',
      when: 'Aug 2026 – Present',
      points: [
        'Mentor 36 first-year students 1:1 on HTML, CSS, JavaScript, React, and databases, resolving conceptual and debugging doubts.',
        "Focus on the 'why' behind each concept so mentees can reason through problems instead of memorizing syntax.",
      ],
    },
  ],
  projects: [
    {
      what: 'Relayo',
      tag: 'AI Automation System for a Messaging Startup',
      stack: 'n8n, Groq LLMs, Google Sheets, Gmail, Discord API, Slack',
      points: [
        'Built 4 independent n8n workflow modules (email, billing, Discord, self-monitoring) that classify each item, draft a reply, then auto-send or flag it for human review.',
        'Decoupled review from sending: flagged items are logged to Google Sheets and a separate scheduled workflow sends them once approved, so no execution sits idle waiting on a human.',
        'Hardened the email handler with strict-JSON LLM output, Gmail message-ID dedupe, silent spam discard, and phishing and prompt-injection defenses; billing disputes always go to a human and invoices are templated, never LLM-generated.',
        "Worked around n8n's missing Discord trigger by polling the REST API with workflow static data; added watchdogs for reviews stale 3+ days and a health check on Groq, Gmail, Sheets, and Discord.",
      ],
    },
    {
      what: 'Ripple',
      tag: 'Project Planner with Critical-Path Analysis',
      stack: 'MERN, Mongoose, JWT, Tailwind CSS',
      points: [
        'Built a full-stack planner that turns tasks, durations, and dependencies into a schedule and critical path, with a what-if simulator showing how a slipped task moves the finish date without touching the real plan.',
        'Implemented JWT auth in HttpOnly cookies with bcrypt hashing, and configured cookie and CORS settings separately for development and production.',
      ],
    },
    {
      what: 'Nexora',
      tag: 'Full-Stack E-Commerce Platform',
      stack: 'React 19, Vite, Express, MongoDB, Tailwind CSS',
      points: [
        'Built customer auth (JWT in HTTP-only cookies, protected and public routes via React context) and profile management with shipping address and image upload (Multer, 2 MB limit).',
        'Built product catalogue APIs with case-insensitive search, category filtering, and price sorting, plus a persistent per-customer wishlist behind protected REST endpoints.',
      ],
    },
    {
      what: 'TA Doubt Assistant',
      tag: 'RAG-Powered Support Bot',
      stack: 'n8n, LangChain, HuggingFace, FAISS',
      points: [
        'Built a RAG workflow with semantic search that auto-answers student doubts, remembers follow-ups, escalates unresolved queries by email, and grows its own knowledge base.',
        'Re-implemented each n8n concept (tool calling, conversation memory, RAG) in LangChain (Python) to understand the underlying mechanics.',
      ],
    },
  ],
  other: [
    { what: 'Blood Donor Finder', stack: 'React, Hooks, REST API', text: 'search and filter donors with live availability sorting and a request-help flow.' },
    { what: 'Gesture Control', stack: 'Python, OpenCV', text: 'hand-gesture game controller, including a custom build for ev.io.' },
    { what: 'Orisca', stack: 'HTML, CSS', text: 'space-themed portfolio with 3D rotating navigation and custom CSS animations.' },
    { what: 'CodeQuest and KeyMonk', stack: 'HTML/CSS/JS', text: 'a visual DSA explainer site and a Monkeytype-style typing test with live WPM/accuracy.' },
  ],
  skills: [
    { label: 'Languages', text: 'JavaScript, Python, Java, HTML5, CSS3' },
    { label: 'Web (MERN)', text: 'React, Node.js, Express, MongoDB/Mongoose, REST APIs, JWT auth, Tailwind CSS, Vite' },
    { label: 'Automation & AI', text: 'n8n, LangChain, RAG (FAISS, HuggingFace embeddings), LLM tool-calling (Groq), Slack/Gmail/Google Sheets/Discord integrations' },
    { label: 'ML (coursework)', text: 'Regression, kNN, Decision Trees, Ensembles, Clustering, PCA' },
    { label: 'Tools', text: 'Git, GitHub, OpenCV' },
  ],
  achievements: [
    '3rd Place (Team) — RoboDog Locomotion Challenge Hackathon',
    '3rd Place — Escape Room Competition, Paradox Fest, IIT Madras',
    'Participant — Auraverse & Auraverse 2.0 Hackathons, Scaler School of Technology',
    'Volunteer — Meta x Scaler Hackathon',
  ],
}