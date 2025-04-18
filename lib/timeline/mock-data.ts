import { AICapability, Domain } from './types';

/**
 * Mock data for the AI capabilities timeline
 */
export const mockCapabilities: AICapability[] = [
  {
    id: 'gpt4-release',
    date: '2023-03-14',
    title: 'GPT-4 Release',
    description: 'GPT-4 is OpenAI\'s most advanced system, producing safer and more useful responses.',
    domain: 'general',
    isModelImprovement: true,
    modelName: 'GPT-4',
    examples: [
      {
        title: 'Multimodal Understanding',
        description: 'GPT-4 can accept and process both text and image inputs, allowing for more complex interactions.',
        implementation: 'Using GPT-4 Vision API to analyze images and respond to questions about them.'
      },
      {
        title: 'Enhanced Reasoning',
        description: 'Improved ability to solve complex problems, including in domains like math and coding.',
        implementation: 'Using GPT-4 to debug code or solve mathematical proofs step by step.'
      }
    ],
    limitations: [
      'Limited knowledge of world events after training cutoff',
      'May occasionally generate incorrect information',
      'Limited vision capabilities compared to specialized vision models',
      'Can still exhibit biases present in training data'
    ],
    technicalRequirements: [
      'API access via OpenAI',
      'Higher token costs than previous models',
      'More compute resources for integration'
    ],
    source: 'https://openai.com/research/gpt-4',
    verified: true
  },
  {
    id: 'image-generation',
    date: '2022-11-30',
    title: 'Text-to-Image Generation',
    description: 'AI models that can generate realistic images from text descriptions.',
    domain: 'creative',
    examples: [
      {
        title: 'Product Visualization',
        description: 'Generating product mockups from text descriptions to speed up the design process.',
        implementation: 'Using Midjourney or DALL-E to visualize product concepts before production.'
      },
      {
        title: 'Content Creation',
        description: 'Creating custom illustrations for websites, marketing materials, and publications.',
        implementation: 'Using Stable Diffusion locally to generate custom images while maintaining IP rights.'
      }
    ],
    limitations: [
      'Difficulty with specific details like human hands or text',
      'Style consistency across multiple generations',
      'Copyright and ownership concerns',
      'Potential for generating harmful or biased content'
    ],
    technicalRequirements: [
      'Access to models like DALL-E, Midjourney, or Stable Diffusion',
      'GPU resources for local deployment options',
      'Prompt engineering skills'
    ],
    verified: true
  },
  {
    id: 'claude-3-opus',
    date: '2024-03-04',
    title: 'Claude 3 Opus Release',
    description: 'Anthropic\'s most capable model, with enhanced reasoning and instruction-following abilities.',
    domain: 'general',
    isModelImprovement: true,
    modelName: 'Claude 3 Opus',
    examples: [
      {
        title: 'Complex Task Handling',
        description: 'Handling multi-step tasks with high accuracy and attention to detail.',
        implementation: 'Using Claude 3 Opus for document analysis and extracting structured information.'
      },
      {
        title: 'Enhanced Coding Abilities',
        description: 'Improved code generation and debugging capabilities.',
        implementation: 'Using Claude 3 Opus to generate complete applications with proper error handling.'
      }
    ],
    limitations: [
      'Knowledge cutoff date limitations',
      'Potential for hallucinations in certain contexts',
      'Higher cost compared to smaller models',
      'Lacks specialized capabilities of domain-specific models'
    ],
    technicalRequirements: [
      'API access via Anthropic',
      'Higher token costs than smaller models',
      'Proper prompt engineering for optimal results'
    ],
    source: 'https://www.anthropic.com/news/claude-3-family',
    verified: true
  },
  {
    id: 'ai-coding-assistants',
    date: '2023-06-01',
    title: 'AI Coding Assistants',
    description: 'AI tools that assist developers by generating code, explaining functionality, and debugging issues.',
    domain: 'business',
    examples: [
      {
        title: 'Code Generation',
        description: 'Automatically generating boilerplate code and common functions.',
        implementation: 'Using GitHub Copilot or similar tools integrated with IDEs.'
      },
      {
        title: 'Code Explanation',
        description: 'Helping developers understand unfamiliar code or complex functions.',
        implementation: 'Using language models to explain code functionality and suggest improvements.'
      }
    ],
    limitations: [
      'May generate insecure or inefficient code',
      'Limited understanding of large codebases',
      'Can suggest deprecated or incorrect approaches',
      'Legal and licensing concerns with generated code'
    ],
    technicalRequirements: [
      'IDE plugins or extensions',
      'Subscription to services like GitHub Copilot or access to LLMs',
      'Basic programming knowledge to validate generated code'
    ],
    verified: true
  },
  {
    id: 'llm-function-calling',
    date: '2023-11-06',
    title: 'LLM Function Calling',
    description: 'The ability for large language models to identify when and how to call external functions based on user prompts.',
    domain: 'general',
    examples: [
      {
        title: 'Data Processing Automation',
        description: 'Automatically calling appropriate data processing functions based on natural language requests.',
        implementation: 'Using OpenAI function calling to route requests to the correct data processing pipelines.'
      },
      {
        title: 'External Tool Integration',
        description: 'Connecting LLMs to external tools and services through structured function interfaces.',
        implementation: 'Building agents that can interact with databases, APIs, and other services based on user requests.'
      }
    ],
    limitations: [
      'Potential for misinterpreting user intent',
      'Security concerns with automated function execution',
      'Limited to predefined function sets',
      'Requires careful function definition to ensure proper use'
    ],
    technicalRequirements: [
      'Access to LLMs with function calling capabilities',
      'Well-defined function schemas',
      'Security protocols for function execution'
    ],
    verified: true
  },
  {
    id: 'multimodal-agents',
    date: '2024-02-15',
    title: 'Multimodal AI Agents',
    description: 'AI systems that can process and generate multiple types of data (text, images, audio) simultaneously.',
    domain: 'science',
    examples: [
      {
        title: 'Research Analysis',
        description: 'Analyzing scientific papers including text, charts, and diagrams holistically.',
        implementation: 'Using multimodal models to extract insights from research publications with complex data visualizations.'
      },
      {
        title: 'Medical Diagnosis Support',
        description: 'Analyzing medical images alongside patient data and symptoms.',
        implementation: 'Supporting healthcare professionals by correlating visual medical data with textual patient information.'
      }
    ],
    limitations: [
      'Lower performance in specialized tasks compared to single-modality models',
      'Higher computational requirements',
      'Complexity in handling different types of data simultaneously',
      'Potential for cross-modal errors and hallucinations'
    ],
    technicalRequirements: [
      'Access to multimodal AI models',
      'Significantly higher computational resources',
      'Specialized prompt engineering techniques'
    ],
    verified: true
  },
  {
    id: 'rag-systems',
    date: '2023-04-20',
    title: 'Retrieval-Augmented Generation (RAG)',
    description: 'Enhancing LLM responses by retrieving relevant information from external knowledge sources before generating content.',
    domain: 'business',
    examples: [
      {
        title: 'Enterprise Knowledge Systems',
        description: 'Creating AI assistants that can access and utilize company-specific knowledge.',
        implementation: 'Building a RAG system connected to company documentation, policies, and databases.'
      },
      {
        title: 'Factual Grounding',
        description: 'Reducing hallucinations by providing factual context before generation.',
        implementation: 'Using vector databases and semantic search to retrieve relevant context before prompting an LLM.'
      }
    ],
    limitations: [
      'Quality dependent on retrieval system effectiveness',
      'Challenges with contradictory information',
      'Handling of large document collections',
      'Context window limitations for incorporating retrieved information'
    ],
    technicalRequirements: [
      'Vector database for efficient semantic search',
      'Document processing pipeline',
      'Embedding models for content vectorization',
      'LLM access for generation phase'
    ],
    verified: true
  },
  {
    id: 'gemini-pro',
    date: '2023-12-06',
    title: 'Gemini Pro Release',
    description: 'Google\'s multimodal AI model designed to understand and combine different types of information.',
    domain: 'general',
    isModelImprovement: true,
    modelName: 'Gemini Pro',
    examples: [
      {
        title: 'Multimodal Understanding',
        description: 'Processing text, images, audio, and video in a cohesive way.',
        implementation: 'Using Gemini to analyze presentation slides with both textual and visual content.'
      },
      {
        title: 'Educational Applications',
        description: 'Enhancing learning experiences by explaining complex topics using multiple formats.',
        implementation: 'Creating interactive educational experiences that combine text explanations with visual aids.'
      }
    ],
    limitations: [
      'Performance varies across different modalities',
      'Knowledge cutoff limitations',
      'Higher resource requirements than text-only models',
      'Potential for hallucinations in certain contexts'
    ],
    technicalRequirements: [
      'Access via Google AI Studio or Vertex AI',
      'Higher computational requirements for multimodal processing',
      'Understanding of multimodal prompt design'
    ],
    source: 'https://deepmind.google/technologies/gemini/',
    verified: true
  },
  {
    id: 'personal-ai-tutor',
    date: '2023-09-10',
    title: 'Personalized AI Tutoring',
    description: 'AI systems that adapt to individual learning styles and needs to provide customized educational support.',
    domain: 'education',
    examples: [
      {
        title: 'Adaptive Learning Paths',
        description: 'Creating personalized curriculum based on student performance and learning pace.',
        implementation: 'Using LLMs with memory of past interactions to tailor educational content progressively.'
      },
      {
        title: 'Interactive Problem Solving',
        description: 'Guiding students through problems with adaptive hints and explanations.',
        implementation: 'Building specialized educational agents that can teach complex subjects with dynamic feedback.'
      }
    ],
    limitations: [
      'Requires significant student data for personalization',
      'Privacy concerns with educational data',
      'May not accommodate all learning styles effectively',
      'Cannot fully replace human educational guidance'
    ],
    technicalRequirements: [
      'LLMs with context management capabilities',
      'Educational content database',
      'Feedback mechanisms for continuous improvement',
      'Privacy-preserving data handling'
    ],
    verified: true
  },
  {
    id: 'voice-cloning',
    date: '2023-07-15',
    title: 'AI Voice Cloning',
    description: 'Technology that can reproduce a person\'s voice with high fidelity using AI.',
    domain: 'creative',
    examples: [
      {
        title: 'Accessible Content Creation',
        description: 'Creating audio versions of written content using familiar voices.',
        implementation: 'Using voice cloning to create audiobooks or podcasts with consistent voice across episodes.'
      },
      {
        title: 'Localization',
        description: 'Translating content while maintaining the original speaker\'s voice characteristics.',
        implementation: 'Using voice cloning combined with translation for multilingual content delivery.'
      }
    ],
    limitations: [
      'Ethical concerns regarding consent and impersonation',
      'Quality degradation with longer outputs',
      'Potential for misuse in scams or misinformation',
      'Emotional range limitations compared to human voice actors'
    ],
    technicalRequirements: [
      'High-quality voice samples for training',
      'Specialized voice synthesis models',
      'Ethical guidelines and consent frameworks'
    ],
    verified: true
  }
];

/**
 * Simulated API function to fetch capabilities
 * @param page The page number to fetch
 * @param limit The number of items per page
 * @param filters Optional filters to apply
 * @returns Paginated capabilities
 */
export async function fetchCapabilities(
  page: number = 1, 
  limit: number = 5,
  filters?: {
    domains?: string[],
    showModelImprovements?: boolean,
    dateRange?: {
      start: string,
      end: string
    }
  }
) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredData = [...mockCapabilities];
  
  // Apply domain filters
  if (filters?.domains && filters.domains.length > 0) {
    filteredData = filteredData.filter(item => 
      filters.domains.includes(item.domain)
    );
  }
  
  // Apply model improvement filter
  if (filters?.showModelImprovements === false) {
    filteredData = filteredData.filter(item => !item.isModelImprovement);
  }
  
  // Apply date range filter
  if (filters?.dateRange) {
    const { start, end } = filters.dateRange;
    filteredData = filteredData.filter(item => {
      const itemDate = new Date(item.date);
      return (
        (!start || itemDate >= new Date(start)) &&
        (!end || itemDate <= new Date(end))
      );
    });
  }
  
  // Sort by date (newest first)
  filteredData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // Paginate results
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    pagination: {
      page,
      limit,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit),
      hasMore: endIndex < filteredData.length
    }
  };
}

/**
 * Get all available domains from capabilities
 */
export function getAvailableDomains(): Domain[] {
  const domains = new Set<Domain>();
  mockCapabilities.forEach(item => {
    domains.add(item.domain);
  });
  return Array.from(domains);
}

/**
 * Get date range for the entire timeline
 */
export function getTimelineRange() {
  const dates = mockCapabilities.map(item => new Date(item.date).getTime());
  const minDate = new Date(Math.min(...dates));
  const maxDate = new Date(Math.max(...dates));
  
  return {
    start: minDate.toISOString().split('T')[0],
    end: maxDate.toISOString().split('T')[0]
  };
}
