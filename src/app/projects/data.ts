export type Category = "AI & Data" | "Mobile" | "Hackathon" | "Personal";

export interface Project {
  title: string;
  slug: string;
  year?: string;
  category: Category;
  featured?: boolean;
  role: string;
  description: string;
  tech: string[];
  links?: { label: string; href: string }[];
}

export const categories: ("All" | Category)[] = ["All", "AI & Data", "Mobile", "Hackathon", "Personal"];

export const projects: Project[] = [
  {
    title: "Gator Guide",
    slug: "gator-guide",
    year: "2026",
    category: "AI & Data",
    featured: true,
    role: "Project lead · AI",
    description:
      "An AI-powered advising platform serving 100+ transfer and high school students with personalized degree-pathway recommendations. I cut recommendation latency by 78% (700–900ms to 150ms) through offline processing, caching, and optimized data retrieval, and built a pipeline that stores user–chatbot interaction metadata in Chroma Cloud and Supabase for semantic search, user profiling, and long-term context.",
    tech: ["Python", "Flutter", "Multi-agent RAG", "Chroma", "Supabase"],
  },
  {
    title: "AskDMV: DMV Practice Test",
    slug: "askdmv",
    category: "Mobile",
    featured: true,
    role: "Co-developer",
    description:
      "A published App Store app for iPhone, iPad, Mac, and Vision Pro with 1,000+ practice questions, an AI tutor, and 7 languages. I build app features and the AI tutor backend across releases.",
    tech: ["Swift", "iOS", "macOS", "visionOS", "LLM tutor"],
  },
  {
    title: "HuskyCart",
    slug: "huskycart",
    year: "2026",
    category: "Hackathon",
    featured: true,
    role: "Mobile frontend · DubHacks ’26",
    description:
      "An AI grocery assistant built at DubHacks ’26. I built most of the mobile frontend — receipt OCR (Perceptron), barcode lookup (Open Food Facts), and Supabase auth, wired to a FastAPI backend — and built and deployed the product landing page on Vercel, developing with Claude Code and Cursor.",
    tech: ["React Native", "Expo", "TypeScript", "FastAPI", "Supabase", "Vercel"],
  },
  {
    title: "Digital Fridge",
    slug: "digital-fridge",
    year: "2025",
    category: "Hackathon",
    role: "Backend · DubHacks ’25",
    description:
      "A smart fridge inventory app built at DubHacks ’25. I built the Flask REST API persisting per-user fridge inventory in AWS S3 (boto3), with API docs and tests, and prototyped Amazon Bedrock flows for AI meal suggestions.",
    tech: ["Python", "Flask", "AWS S3", "Amazon Bedrock", "React"],
  },
  {
    title: "Chess Neural Net",
    slug: "chess-neural-net",
    year: "2026",
    category: "Personal",
    role: "Solo project",
    description:
      "A small residual CNN trained on ~8,700 of my own chess.com games to predict the move I would play. It has no engine and no search — just one forward pass per move — and runs entirely in the browser with pure-TypeScript inference.",
    tech: ["PyTorch", "TypeScript", "CNN", "Next.js"],
    links: [{ label: "Play it", href: "/chess/" }],
  },
];
