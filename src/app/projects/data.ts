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
  note?: string;
}

export const categories: ("All" | Category)[] = ["All", "AI & Data", "Mobile", "Hackathon", "Personal"];

export const projects: Project[] = [
  {
    title: "BEVIJEN: The Resource Engine",
    slug: "bevijen",
    year: "2026",
    category: "AI & Data",
    featured: true,
    role: "Lead architect · AWS Breaking Barriers Hackathon 2026",
    description:
      "A community-resource database that keeps itself up to date. It ingests 211 data, converts it to the Open Referral HSDS standard, and runs AI verifier and discovery agents that write evidence-backed findings for human specialists to approve. As lead architect I designed and built the backend pipelines, the agents, the Cedar policies, the deploy tooling, and the React specialist UI, and deployed it end to end on AWS.",
    tech: ["Python", "FastAPI", "React", "Amazon Bedrock AgentCore", "Claude", "DynamoDB", "S3", "SQS", "Terraform"],
    links: [{ label: "GitHub", href: "https://github.com/hoangviet2/BEVIJEN" }],
  },
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
    note: "Source code is private",
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
    links: [
      { label: "App Store", href: "https://apps.apple.com/us/app/dmv-practice-test-askdmv/id6743694687" },
      { label: "Website", href: "https://askdmv.thomashoanglab.com" },
    ],
  },
  {
    title: "HuskyCart",
    slug: "huskycart",
    year: "2026",
    category: "Hackathon",
    role: "Mobile frontend · DubHacks ’26",
    description:
      "An AI grocery assistant in iMessage, built at DubHacks ’26. I built most of the mobile frontend — receipt OCR (Perceptron), barcode lookup (Open Food Facts), and Supabase auth, wired to a FastAPI backend — and built and deployed the product landing page on Vercel, developing with Claude Code and Cursor.",
    tech: ["React Native", "Expo", "TypeScript", "FastAPI", "Supabase", "Vercel"],
    links: [
      { label: "Live site", href: "https://huskycart.vercel.app/" },
      { label: "GitHub", href: "https://github.com/EvanMarshmellow/pAIntry" },
      { label: "Devpost", href: "https://devpost.com/software/paintry" },
      { label: "Demo", href: "https://www.youtube.com/watch?v=hdWnlKWeRAg" },
    ],
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
    links: [
      { label: "GitHub", href: "https://github.com/MagmaOverlord/Dubhacks-2025" },
      { label: "Devpost", href: "https://devpost.com/software/digital-fridge-x57im3" },
      { label: "Demo", href: "https://vimeo.com/1128650588" },
    ],
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
