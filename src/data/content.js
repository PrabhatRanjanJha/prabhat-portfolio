// All the words on the site live here. Edit this file to change content.

export const profile = {
  name: 'Prabhat',
  fullName: 'Prabhat Ranjan Jha',
  tagline: ['Understand deeply.', 'Build relentlessly.', 'Teach generously.'],
  email: 'prabhatjha2022@gmail.com',
  github: 'https://github.com/PrabhatRanjanJha',
  linkedin: 'https://www.linkedin.com/in/prabhat-ranjan-jha/',
}

export const about = {
  title: 'About',
  paragraphs: [
    "I'm a second-year CS student at Scaler School of Technology in Bengaluru, doing IIT Madras's BS in Data Science and Applications alongside it.",
    "I build automation systems in n8n and web apps on the MERN. Right now I'm a Web Dev TA at Scaler, working one-on-one with first-years on HTML, CSS, JavaScript, React, and databases. Explaining things to someone who's stuck keeps me honest about what I actually understand.",
    'I try problems myself before looking for hints, and I want to know why something works, not just that it does.',
  ],
  facts: [
    ['Scaler School of Technology', 'CS, Batch 2029'],
    ['IIT Madras', 'BS Data Science and Applications, Batch 2029'],
    ['Web Dev TA', 'Scaler, Aug to Oct 2026'],
    ['Based in', 'Bengaluru'],
  ],
}

export const skills = {
  title: 'Skills',
  groups: [
    { name: 'Languages', items: ['Python', 'JavaScript', 'Java'] },
    { name: 'Frontend', items: ['React', 'HTML', 'CSS'] },
    { name: 'Backend', items: ['Node.js', 'Express', 'MongoDB', 'JWT auth'] },
    {
      name: 'Automation and AI',
      items: ['n8n', 'Groq', 'LangChain', 'HuggingFace embeddings', 'FAISS', 'RAG'],
    },
    { name: 'Integrations', items: ['Gmail', 'Google Sheets', 'Slack', 'Discord API', 'SMTP'] },
    { name: 'Data and vision', items: ['Pandas', 'OpenCV'] },
    { name: 'Tools', items: ['Git', 'GitHub'] },
  ],
}

export const services = {
  title: 'Services',
  intro: 'Open to freelance and internship work in web development and automation.',
  items: [
    {
      name: 'Inbox and support automation',
      text: 'Reads incoming email, classifies it, drafts a reply, and either sends it or hands it to a person. Spam is discarded and prompt-injection attempts are handled.',
    },
    {
      name: 'Billing workflows',
      text: 'Invoices generated from payment events, overdue sweeps on a schedule, and payment disputes always routed to a human.',
    },
    {
      name: 'Chat and community handlers',
      text: 'Discord and Slack bots that answer routine messages and escalate the rest, with an instant acknowledgement so nobody feels ignored.',
    },
    {
      name: 'Knowledge-base bots',
      text: 'Retrieval-based assistants that answer from your own documents, flag what they cannot answer, and learn from the answers a person gives.',
    },
    {
      name: 'MERN stack apps',
      text: 'Full-stack web apps on MongoDB, Express, React and Node, for the systems above or for anything else that needs a clean, fast app.',
    },
  ],
}

export const contact = {
  title: 'Say hello',
  text: 'The best way to reach me is email. I read everything.',
}

const gh = (repo) => `https://github.com/PrabhatRanjanJha/${repo}`

export const projects = [
  {
    id: 'relayo',
    name: 'Relayo',
    line: "Four n8n workflows that run a messaging startup's inbox, billing, and chat, with a human in the loop.",
    status: null,
    summary:
      'Built in answer to a real AI Automation Engineer job posting: a multi-agent system for email response, billing monitoring, social channels, and routine admin. Every risky decision passes through a person before it goes out.',
    highlights: [
      'Review and send are separate workflows, so nothing sits in a paused execution waiting on a human.',
      'Invoices are templated, never LLM-generated, so amounts stay exact.',
      'Billing disputes are always flagged for a person and never auto-answered.',
      'Classification prompts treat email content as data, never as instructions, and were tested against real injection attempts.',
      'Discord has no n8n trigger node, so it polls the REST API and keeps the last message ID in workflow static data.',
    ],
    stack: ['n8n', 'Groq', 'Google Sheets', 'Gmail', 'Discord', 'Slack'],
    links: { github: gh('Relayo') },
    graph: 'relayo',
  },
  {
    id: 'ta-doubt-assistant',
    name: 'TA Doubt Assistant',
    line: "A RAG bot that answers students' doubts, escalates what it can't, and learns from the TA's replies.",
    status: null,
    summary:
      'Built to automate doubt handling for web development courses at Scaler. Students submit a doubt through a form; the system answers it from a knowledge base or flags it for the TA.',
    highlights: [
      'Semantic search, so a question is matched even when it is phrased differently from the stored one.',
      'Follow-up questions keep their context through a session ID and conversation memory.',
      "Every answer the TA gives is added to the knowledge base and re-indexed, so the same doubt is answered automatically next time.",
      'Students who ask five or more follow-ups on one topic are flagged as struggling.',
      'Ships with 30 Q&A pairs covering HTML, CSS, and JavaScript.',
    ],
    stack: ['n8n', 'Groq (LLaMA 3.3 70B)', 'HuggingFace MiniLM', 'Vector store', 'Google Sheets', 'Gmail'],
    links: { github: gh('ta-doubt-assistant') },
    graph: 'ta',
  },
  {
    id: 'ripple',
    name: 'Ripple',
    line: 'A project planner that finds the critical path and simulates delays without touching the real plan.',
    summary:
      'You add tasks with durations and dependencies. Ripple works out the schedule and the critical path, the chain of tasks that decides your finish date. A what-if simulator shows what a slipping task does to that date.',
    highlights: [
      'Critical-path scheduling over task dependencies.',
      'A what-if simulator that shows what a slipping task does to the finish date without touching the real plan.',
      'JWT authentication in HttpOnly cookies, passwords hashed with bcrypt.',
    ],
    stack: ['MongoDB', 'Express', 'React', 'Node.js', 'Tailwind CSS'],
    links: { github: gh('ripple'), live: 'https://ripple-three-omega.vercel.app/' },
    graph: 'ripple',
  },
  {
    id: 'nexora',
    name: 'Nexora',
    line: 'A full-stack e-commerce app with catalogue, cart, Razorpay test-mode checkout, and order history.',
    status: null,
    summary:
      'Customers register, browse a database-backed catalogue, search and filter, keep a wishlist and a persistent cart, pay through Razorpay in test mode, and view past orders.',
    highlights: [
      'Totals are calculated on the server. Prices sent by the browser are never trusted.',
      'Razorpay payment signatures are verified server-side before an order is marked placed.',
      "Order items are copied at checkout, so later product edits don't change old receipts.",
      'JWT in HTTP-only cookies, with protected routes on both the API and the frontend.',
      'Stock-aware cart quantities and customer-specific wishlist.',
    ],
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'Express 5', 'MongoDB', 'Razorpay'],
    links: { github: gh('Nexora'), live: 'https://nexora-ebon-one.vercel.app/' },
    graph: 'nexora',
  },
  {
    id: 'keymonk',
    name: 'KeyMonk',
    line: 'A Monkeytype-inspired typing test with live WPM, accuracy, and a history log.',
    status: null,
    summary:
      'A typing test built in vanilla JavaScript with live speed and accuracy tracking, a history of past runs, and multiple modes.',
    highlights: [
      'Live WPM and accuracy while you type.',
      'History log of previous runs.',
      'Built without a framework, directly against the DOM.',
    ],
    stack: ['JavaScript', 'DOM'],
    links: { github: gh('MonkeyType_Clone'), live: 'https://prabhatranjanjha.github.io/MonkeyType_Clone/' },
    graph: 'keymonk',
  },
  {
    id: 'codequest',
    name: 'CodeQuest',
    line: 'An interactive site that teaches arrays, recursion, and sorting through visual explanations.',
    status: null,
    summary:
      'A learning site for core DSA concepts where each idea is shown step by step instead of described in a paragraph.',
    highlights: [
      'Visual walkthroughs of arrays, recursion, and sorting.',
      'Built with plain HTML, CSS, and JavaScript.',
    ],
    stack: ['HTML', 'CSS', 'JavaScript'],
    links: { github: gh('CodeQuest'), live: 'https://code-quest-two-mu.vercel.app' },
    graph: 'codequest',
  },
]