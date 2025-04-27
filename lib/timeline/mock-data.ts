/**
 * Mock data for AI capabilities timeline
 * This file provides sample data for the "What AI Can/Can't Do" timeline feature
 */

export interface AICapability {
  id: string;
  title: string;
  description: string;
  dateAdded: string; // Convert to Date when using in DB
  category: string;
  status: 'current' | 'emerging' | 'theoretical' | 'deprecated';
  exampleUse?: string;
  limitations?: string[];
  sourceUrl?: string;
  relatedCapabilities?: string[];
  
  // Additional properties for database compatibility
  date?: string | Date; // Use this for compatibility with the seed script
  domain?: string; // Maps to category
  isModelImprovement?: boolean;
  modelName?: string;
  source?: string; // Maps to sourceUrl
  verified?: boolean;
  technicalRequirements?: string[];
  examples?: Array<{title: string; description: string}>; // For seed script compatibility
}

export const mockCapabilities: AICapability[] = [
  {
    id: "text-generation",
    title: "Text Generation",
    description: "AI can generate human-like text for various purposes, including content creation, summarization, and translation.",
    dateAdded: "2023-01-15",
    category: "Language",
    status: "current",
    exampleUse: "Writing blog posts, creating marketing copy, generating code comments",
    limitations: [
      "May produce factually incorrect information",
      "Can reflect biases in training data",
      "Lacks true understanding of content"
    ],
    relatedCapabilities: ["summarization", "translation"]
  },
  {
    id: "image-generation",
    title: "Image Generation from Text",
    description: "AI can create original images based on text descriptions, enabling visual content creation without design skills.",
    dateAdded: "2023-02-10",
    category: "Visual",
    status: "current",
    exampleUse: "Creating illustrations, generating product mockups, designing marketing materials",
    limitations: [
      "May struggle with specific details like human hands",
      "Can produce inappropriate content without proper safeguards",
      "May reflect biases in training data"
    ],
    relatedCapabilities: ["style-transfer", "image-editing"]
  },
  {
    id: "code-generation",
    title: "Code Generation",
    description: "AI can generate functional code across various programming languages from natural language descriptions.",
    dateAdded: "2023-03-05",
    category: "Development",
    status: "current",
    exampleUse: "Creating boilerplate code, solving programming challenges, suggesting code improvements",
    limitations: [
      "May produce code with bugs or security vulnerabilities",
      "Struggles with complex algorithms or specialized domains",
      "Limited understanding of project context"
    ],
    relatedCapabilities: ["code-analysis", "debugging-assistance"]
  },
  {
    id: "summarization",
    title: "Text Summarization",
    description: "AI can condense long documents while retaining the most important information.",
    dateAdded: "2023-01-20",
    category: "Language",
    status: "current",
    exampleUse: "Summarizing research papers, creating executive summaries, condensing meeting notes",
    limitations: [
      "May miss important nuance or context",
      "Can struggle with highly technical content",
      "Quality decreases with very long documents"
    ],
    relatedCapabilities: ["text-generation", "information-extraction"]
  },
  {
    id: "multimodal-reasoning",
    title: "Multimodal Reasoning",
    description: "AI can process and reason across different types of information (text, images, audio) simultaneously.",
    dateAdded: "2023-08-12",
    category: "General Intelligence",
    status: "emerging",
    exampleUse: "Answering questions about images, creating content based on multiple inputs, accessibility applications",
    limitations: [
      "Integration between modalities still limited",
      "Performance varies across different combinations",
      "Higher computational requirements"
    ],
    relatedCapabilities: ["image-understanding", "text-generation"]
  },
  {
    id: "conversational-memory",
    title: "Long-Term Conversational Memory",
    description: "AI can maintain context and remember details across extended conversations.",
    dateAdded: "2023-11-05",
    category: "Language",
    status: "emerging",
    exampleUse: "Extended customer support, virtual assistants, therapeutic applications",
    limitations: [
      "Limited to specific implementations",
      "Memory capacity still constrained",
      "May confuse details between different conversations"
    ],
    relatedCapabilities: ["text-generation", "personalization"]
  },
  {
    id: "tool-use",
    title: "Autonomous Tool Use",
    description: "AI can identify, select, and utilize external tools to accomplish tasks.",
    dateAdded: "2023-09-30",
    category: "Agents",
    status: "emerging",
    exampleUse: "Web browsing, data analysis, software operation",
    limitations: [
      "Limited understanding of tool capabilities",
      "Prone to errors in complex workflows",
      "May make incorrect tool selections"
    ],
    relatedCapabilities: ["task-planning", "code-generation"]
  },
  {
    id: "general-reasoning",
    title: "General Logical Reasoning",
    description: "AI can solve novel problems through logical deduction and reasoning.",
    dateAdded: "2024-01-15",
    category: "General Intelligence",
    status: "emerging",
    exampleUse: "Complex problem-solving, strategic planning, scientific research assistance",
    limitations: [
      "Reasoning chains can break down with complexity",
      "May appear logical while arriving at incorrect conclusions",
      "Limited self-correction capabilities"
    ],
    relatedCapabilities: ["symbolic-manipulation", "mathematical-reasoning"]
  },
  {
    id: "consciousness",
    title: "Machine Consciousness",
    description: "The theoretical capability of AI systems to possess subjective experiences or qualia.",
    dateAdded: "2024-02-01",
    category: "General Intelligence",
    status: "theoretical",
    limitations: [
      "No scientific consensus on requirements for consciousness",
      "May be fundamentally different from human consciousness",
      "Currently no reliable methods to measure or verify"
    ]
  },
  {
    id: "generalized-intelligence",
    title: "Human-Level Generalized Intelligence",
    description: "AI systems that match or exceed human capabilities across all cognitive domains simultaneously.",
    dateAdded: "2024-02-10",
    category: "General Intelligence",
    status: "theoretical",
    limitations: [
      "Computational requirements potentially immense",
      "May require fundamentally different architectures",
      "Social and ethical implications poorly understood"
    ]
  }
];
