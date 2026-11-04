import { Conversation, Message } from "./types";
import { generateId } from "./utils";

const now = new Date();
const minus = (m: number) => new Date(now.getTime() - m * 60000);

export const DUMMY_SOURCES = [
  {
    id: 1,
    title: "Pinecone Documentation",
    url: "https://docs.pinecone.io",
    description: "Official docs for Pinecone vector database.",
    favicon: "P",
  },
  {
    id: 2,
    title: "OpenAI Embeddings Guide",
    url: "https://platform.openai.com/docs/guides/embeddings",
    description: "How to use OpenAI text embeddings.",
    favicon: "O",
  },
  {
    id: 3,
    title: "Weaviate Blog",
    url: "https://weaviate.io/blog",
    description: "Vector search and AI-native database insights.",
    favicon: "W",
  },
];

export const DUMMY_RELATED = [
  { id: 1, text: "How does RAG improve AI accuracy?" },
  { id: 2, text: "What vector database should I use?" },
  { id: 3, text: "Difference between embeddings and tokens?" },
];

const ragAnswer: Message = {
  id: generateId(),
  role: "assistant",
  content: `## Vector Databases Explained

A **vector database** stores high-dimensional numerical representations (embeddings) of data — text, images, audio — and enables fast **semantic similarity search**.

### How They Work

1. **Ingestion** — data is converted to embeddings via a model (e.g. OpenAI \`text-embedding-3-small\`)
2. **Indexing** — vectors are indexed using ANN algorithms (HNSW, IVF)
3. **Query** — a query embedding is compared to stored vectors, returning nearest neighbors

### Popular Options

| Database | Best For | Open Source |
|----------|----------|-------------|
| Pinecone | Managed scale | ❌ |
| Weaviate | Hybrid search | ✅ |
| Qdrant | Rust performance | ✅ |
| pgvector | Postgres users | ✅ |

### Example (Python)

\`\`\`python
import openai, pinecone

# Create embedding
res = openai.embeddings.create(
    input="What is RAG?",
    model="text-embedding-3-small"
)
vector = res.data[0].embedding

# Query Pinecone
index.query(vector=vector, top_k=5)
\`\`\`

Vector databases are the backbone of **Retrieval-Augmented Generation (RAG)** pipelines.`,
  sources: DUMMY_SOURCES,
  relatedQuestions: DUMMY_RELATED,
  thinking: ["Searching web...", "Reading sources...", "Generating answer..."],
  timestamp: minus(2),
};

export const DUMMY_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    title: "Best AI tools in 2026",
    timestamp: minus(120),
    messages: [
      { id: generateId(), role: "user", content: "Best AI tools in 2026?", timestamp: minus(122) },
      {
        id: generateId(),
        role: "assistant",
        content:
          "The top AI tools in 2026 include **Cursor** for coding, **Oryn** for research, **Runway** for video generation, and **NotebookLM** for document analysis.",
        sources: [
          { id: 1, title: "TechCrunch AI Roundup", url: "https://techcrunch.com", description: "Top AI tools of the year.", favicon: "T" },
        ],
        relatedQuestions: [{ id: 1, text: "How to integrate AI into my workflow?" }],
        timestamp: minus(120),
      },
    ],
  },
  {
    id: "conv-2",
    title: "React Server Components explained",
    timestamp: minus(360),
    messages: [
      { id: generateId(), role: "user", content: "Explain React Server Components", timestamp: minus(362) },
      {
        id: generateId(),
        role: "assistant",
        content:
          "**React Server Components (RSC)** run exclusively on the server, reducing JS bundle size. They cannot use hooks or browser APIs but can directly access databases and filesystems.",
        timestamp: minus(360),
      },
    ],
  },
  {
    id: "conv-3",
    title: "How does RAG work?",
    timestamp: minus(1440),
    messages: [
      { id: generateId(), role: "user", content: "Explain vector databases", timestamp: minus(1442) },
      ragAnswer,
    ],
  },
  {
    id: "conv-4",
    title: "Next.js deployment guide",
    timestamp: minus(2880),
    messages: [
      { id: generateId(), role: "user", content: "How do I deploy a Next.js app?", timestamp: minus(2882) },
      {
        id: generateId(),
        role: "assistant",
        content:
          "Deploy Next.js on **Vercel** (zero-config), **Railway**, or self-host with `next start`. Run `npm run build` first, then push to your platform.",
        timestamp: minus(2880),
      },
    ],
  },
];

export const SUGGESTED_PROMPTS = [
  {
    id: 1,
    title: "What are some easy dinners I can make this week?",
    subtitle: "Simple ideas with everyday ingredients",
    icon: "🍲",
  },
  {
    id: 2,
    title: "How can I get better sleep?",
    subtitle: "Small habits that make a difference",
    icon: "🌙",
  },
  {
    id: 3,
    title: "What should I see on a first trip to Kyoto?",
    subtitle: "A relaxed guide to neighborhoods and sights",
    icon: "🗺️",
  },
  {
    id: 4,
    title: "How can I make my home use less energy?",
    subtitle: "Practical changes that can lower energy use",
    icon: "🌿",
  },
];

export const AI_MODELS = ["GPT-5", "Claude 4", "Gemini 2.5", "Llama 4"];
