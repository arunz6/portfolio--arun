export const profile = {
  name: 'Arun Rajput',
  location: 'Indore, Madhya Pradesh, India',
  email: 'arunrajput88176894@gmail.com',
  github: 'https://github.com/arunz6',
  linkedin: 'https://www.linkedin.com/in/arun-rajput-592a68373/',
}

export const featured = [
  {
    id: 'battle-arena', layout: 'split', title: 'AI Battle Arena', category: 'AI application', year: '2026',
    description: 'Compares AI answers side by side. Mistral and Cohere respond to the same prompt in parallel, then Gemini judges the results.',
    features: ['Parallel response generation', 'AI-based judging and evaluation', 'Comparative response presentation', 'Orchestration with LangGraph'],
    tech: ['React', 'TypeScript', 'Express', 'LangGraph', 'Mistral', 'Cohere', 'Gemini'],
    contribution: 'Solo-built.',
    live: 'https://battlearena-1-0q5k.onrender.com/', repo: 'https://github.com/arunz6/battelarena',
    flow: [['Prompt'], ['Mistral', 'Cohere'], ['Gemini judges'], ['Side-by-side result']],
  },
  {
    id: 'perplexity', layout: 'wide', title: 'Perplexity AI Clone', category: 'AI search', year: '2026',
    description: 'An AI search experience where a ReAct agent uses Tavily to search the web, with sign-in and saved chat history.',
    features: ['AI-assisted web search', 'Agent orchestration', 'Authentication', 'Chat history'],
    tech: ['React', 'Node.js', 'Express', 'MongoDB', 'LangGraph', 'Mistral', 'Tavily', 'Socket.IO', 'JWT'],
    contribution: 'Solo-built.',
    live: 'https://perplexity-ai-kj4l.onrender.com/', repo: 'https://github.com/arunz6/perplexity-ai',
    flow: [['Question'], ['Reason'], ['Tavily search'], ['Answer']],
  },
  {
    id: 'snitch', layout: 'reverse', title: 'Snitch E-commerce', category: 'Full-stack e-commerce', year: '2026',
    description: 'A full-stack store with separate buyer and seller flows, a cart, and product image management.',
    features: ['Product management', 'Buyer and seller experiences', 'Cart', 'Authentication', 'Product image management'],
    tech: ['MongoDB', 'Express', 'React', 'Node.js', 'Redux', 'JWT', 'Google OAuth', 'Cloudinary'],
    contribution: 'Solo-built e-commerce project.',
    live: 'https://snitch-taml.onrender.com/', repo: 'https://github.com/arunz6/snitch',
    flow: [['Seller lists product'], ['Cloudinary stores images'], ['Buyer adds to cart']],
  },
  {
    id: 'final-clue', layout: 'stack', title: 'The Final Clue', category: 'Team treasure-hunt game', year: '2026',
    description: 'A team-based treasure hunt with progressive clues, levels, QR scanning and a leaderboard.',
    features: ['Interactive clue progression', 'Team-based gameplay', 'QR scanning', 'Leaderboard'],
    tech: ['React', 'Vite', 'Node.js', 'Express', 'MongoDB', 'Socket.IO', 'QR scanning'],
    contribution: 'Solo-built.',
    live: 'https://thefinalclue.onrender.com/', repo: 'https://github.com/arunz6/hintgame-main',
    flow: [['Level 1'], ['Level 2'], ['Level 3'], ['Level 4']],
  },
]

export const more = [
  { title: 'PhishGuard 2.0', note: 'Browser extension for phishing detection, built with a friend in BCA final year. My main part was the detection logic.', repo: 'https://github.com/arunz6/phishing-guard2.0' },
  { title: 'macOS Clone UI', note: 'A macOS-inspired web UI recreation.', live: 'https://mac-os-clone-ui.onrender.com/', repo: 'https://github.com/arunz6/mac-os-clone' },
  { title: 'AI Customer Support', note: 'Work in progress. See the repository for current status.', repo: 'https://github.com/arunz6/ai-customer-support' },
]

export const skills = [
  ['Frontend', ['React.js', 'Redux.js', 'JavaScript', 'HTML5', 'CSS', 'Tailwind CSS', 'SASS', 'Three.js', 'GSAP']],
  ['Backend', ['Node.js', 'Express.js', 'MongoDB', 'Mongoose', 'TypeScript', 'Socket.IO', 'JWT', 'REST APIs', 'Axios', 'Zod']],
  ['AI and GenAI', ['LangChain', 'LangGraph', 'Prompt Engineering']],
  ['Tools and deployment', ['Git', 'GitHub', 'Postman', 'VS Code', 'Nodemon', 'Render']],
  ['Additional', ['Chrome Extension Development', 'DOM', 'Digital Authentication', 'Web Servers']],
]

export const experience = {
  role: 'Full Stack DevOps Engineer', company: 'Agniro', period: 'September 2026 to present', site: 'https://agnro-website.onrender.com/',
  points: [
    'Implemented website pages and components from a supplied UI design.',
    'Built the admin panel, frontend and backend.',
    'Worked on deployment.',
  ],
}

export const education = [
  { school: 'SGSITS Indore', degree: 'Master of Computer Applications (MCA)', period: 'Expected 2028', note: 'Currently pursuing.' },
  { school: 'Vikrant University, Gwalior', degree: 'Bachelor of Computer Applications, Information Technology', period: 'August 2023 to May 2026', note: 'CGPA 7.79' },
]

export const achievement = {
  title: 'Sheryians Cohort Hackathon 2026',
  text: 'Led a three-member team building an AI-powered customer support platform for multi-tenant onboarding. Contributed to frontend and backend work, task delegation and team coordination under time pressure.',
}
