import React from 'react';
import { ExternalLink, Search, Feather, PenTool, Presentation, BrainCircuit, Layers, Bot, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface ToolCardProps {
  title: string;
  description: string;
  category: string;
  url: string;
  free: boolean;
  proFeatures?: string[];
}

function ToolCard({ title, description, category, url, free, proFeatures }: ToolCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{title}</CardTitle>
          {free && <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs px-2 py-1 rounded-full">Free</span>}
        </div>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {proFeatures && proFeatures.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Key Features:</p>
            <ul className="text-sm space-y-1">
              {proFeatures.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Star className="h-4 w-4 text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <Button variant="outline" className="w-full" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center">
            Visit Tool <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    </Card>
  );
}

export default function ToolkitPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">AI Toolkit</h1>
        
        <section className="mb-12">
          <p className="text-lg mb-6">
            Our curated collection of AI tools to help you get started with practical AI applications. 
            These tools are selected based on their usability, reliability, and value for both beginners 
            and experienced users.
          </p>
          <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg mb-8">
            <h2 className="text-xl font-semibold mb-4">How to Use This Toolkit</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <div className="bg-white dark:bg-slate-700 rounded-full p-1 mr-3 mt-0.5">
                  <Search className="h-4 w-4 text-primary" />
                </div>
                <span><strong>Explore by category</strong> to find tools relevant to your specific needs</span>
              </li>
              <li className="flex items-start">
                <div className="bg-white dark:bg-slate-700 rounded-full p-1 mr-3 mt-0.5">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <span><strong>Look for free options</strong> to get started without financial commitment</span>
              </li>
              <li className="flex items-start">
                <div className="bg-white dark:bg-slate-700 rounded-full p-1 mr-3 mt-0.5">
                  <Layers className="h-4 w-4 text-primary" />
                </div>
                <span><strong>Start simple and scale up</strong> as you become more comfortable with AI tools</span>
              </li>
            </ul>
          </div>
        </section>
        
        <section>
          <Tabs defaultValue="llm" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 mb-8">
              <TabsTrigger value="llm" className="flex items-center gap-2">
                <BrainCircuit className="h-4 w-4" />
                <span>Chat & LLMs</span>
              </TabsTrigger>
              <TabsTrigger value="productivity" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <span>Productivity</span>
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="writing" className="flex items-center gap-2">
                <Feather className="h-4 w-4" />
                <span>Writing</span>
              </TabsTrigger>
              <TabsTrigger value="design" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                <span>Design</span>
              </TabsTrigger>
              <TabsTrigger value="presentation" className="flex items-center gap-2">
                <Presentation className="h-4 w-4" />
                <span>Presentation</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="llm" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="ChatGPT"
                  description="OpenAI's conversational AI assistant for a wide range of tasks including writing, problem-solving, and creative content generation."
                  category="llm"
                  url="https://chat.openai.com/"
                  free={true}
                  proFeatures={[
                    "Access to GPT-4o capabilities",
                    "Complex writing and editing assistance",
                    "Code generation and debugging",
                    "Ideation and brainstorming"
                  ]}
                />
                <ToolCard 
                  title="Claude"
                  description="Anthropic's AI assistant known for thoughtful, nuanced, and creative responses with strong reasoning capabilities."
                  category="llm"
                  url="https://claude.ai/"
                  free={true}
                  proFeatures={[
                    "Longer, more nuanced conversations",
                    "Careful reasoning and analysis",
                    "Document understanding and summarization",
                    "Higher quality responses for complex tasks"
                  ]}
                />
                <ToolCard 
                  title="Bing Chat (Microsoft Copilot)"
                  description="Microsoft's AI assistant integrated with web search for up-to-date information and assistance."
                  category="llm"
                  url="https://www.bing.com/chat"
                  free={true}
                  proFeatures={[
                    "Real-time web search integration",
                    "Multimodal capabilities (image generation and analysis)",
                    "Multiple conversation tones",
                    "Integration with Microsoft products"
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="productivity" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="Notion AI"
                  description="AI writing assistant integrated with Notion's workspace to help draft, edit, and brainstorm content."
                  category="productivity"
                  url="https://www.notion.so/product/ai"
                  free={false}
                  proFeatures={[
                    "Content summarization and expansion",
                    "Meeting notes translation and enhancement",
                    "Task management automation",
                    "Integrated within Notion workspace"
                  ]}
                />
                <ToolCard 
                  title="Motion"
                  description="AI-powered calendar and task management tool that automatically schedules your work based on priorities."
                  category="productivity"
                  url="https://www.usemotion.com/"
                  free={false}
                  proFeatures={[
                    "Intelligent task scheduling",
                    "Meeting time optimization",
                    "Deadline management",
                    "Focus time protection"
                  ]}
                />
                <ToolCard 
                  title="Mem.ai"
                  description="AI-powered note-taking app that automatically organizes your notes and generates insights."
                  category="productivity"
                  url="https://mem.ai/"
                  free={true}
                  proFeatures={[
                    "Automatic knowledge organization",
                    "Smart search across all notes",
                    "AI-generated summaries and insights",
                    "Quick capture from multiple sources"
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="Perplexity"
                  description="AI-powered search engine that provides comprehensive, cited answers to complex questions."
                  category="search"
                  url="https://www.perplexity.ai/"
                  free={true}
                  proFeatures={[
                    "Real-time information retrieval",
                    "Source citation for verification",
                    "Multi-step research capabilities",
                    "Follow-up question handling"
                  ]}
                />
                <ToolCard 
                  title="You.com"
                  description="Conversational search engine that combines web results with AI-generated summaries and responses."
                  category="search"
                  url="https://you.com/"
                  free={true}
                  proFeatures={[
                    "Chat-based search interface",
                    "App integrations for specialized searches",
                    "Private mode for sensitive searches",
                    "Code-specific search capabilities"
                  ]}
                />
                <ToolCard 
                  title="Consensus"
                  description="AI research assistant that searches academic papers and summarizes scientific consensus on topics."
                  category="search"
                  url="https://consensus.app/"
                  free={true}
                  proFeatures={[
                    "Academic paper search and summarization",
                    "Research synthesis across studies",
                    "Citation extraction and management",
                    "Scientific consensus analysis"
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="writing" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="Grammarly"
                  description="AI writing assistant that checks grammar, clarity, engagement, and delivery in your writing."
                  category="writing"
                  url="https://www.grammarly.com/"
                  free={true}
                  proFeatures={[
                    "Grammar and spelling correction",
                    "Tone and clarity adjustments",
                    "Integration with multiple platforms",
                    "Plagiarism detection (premium)"
                  ]}
                />
                <ToolCard 
                  title="Jasper"
                  description="AI content platform for creating marketing copy, blog posts, social media content, and more."
                  category="writing"
                  url="https://www.jasper.ai/"
                  free={false}
                  proFeatures={[
                    "Marketing-focused content generation",
                    "Brand voice customization",
                    "Team collaboration features",
                    "Multi-format content creation"
                  ]}
                />
                <ToolCard 
                  title="Rytr"
                  description="Affordable AI writing assistant for creating content in 40+ tones and 30+ languages."
                  category="writing"
                  url="https://rytr.me/"
                  free={true}
                  proFeatures={[
                    "Multiple content types and templates",
                    "Tone and language customization",
                    "Plagiarism checker integration",
                    "SEO optimizer assistant"
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="design" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="Midjourney"
                  description="AI image generation tool that creates high-quality, artistic images from text descriptions."
                  category="design"
                  url="https://www.midjourney.com/"
                  free={false}
                  proFeatures={[
                    "High-quality artistic image generation",
                    "Style customization and consistency",
                    "Iterative refinement of generated images",
                    "Community learning and inspiration"
                  ]}
                />
                <ToolCard 
                  title="DALL-E 3"
                  description="OpenAI's image generation model accessible through ChatGPT and the DALL-E website."
                  category="design"
                  url="https://openai.com/dall-e-3"
                  free={true}
                  proFeatures={[
                    "Precise text-to-image generation",
                    "Multi-object compositions",
                    "Style and detail control",
                    "Integration with ChatGPT (with Plus subscription)"
                  ]}
                />
                <ToolCard 
                  title="Canva"
                  description="Design platform with AI features for creating graphics, presentations, videos, and more."
                  category="design"
                  url="https://www.canva.com/"
                  free={true}
                  proFeatures={[
                    "Text-to-image generation (Magic Media)",
                    "Background removal and enhancement",
                    "Content rewriting and summarization",
                    "Auto-design suggestions"
                  ]}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="presentation" className="mt-0">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <ToolCard 
                  title="Beautiful.ai"
                  description="AI-powered presentation software that automatically designs slides as you add content."
                  category="presentation"
                  url="https://www.beautiful.ai/"
                  free={true}
                  proFeatures={[
                    "Automatic slide design and layout",
                    "Smart templates for common presentations",
                    "Real-time team collaboration",
                    "Data visualization assistance"
                  ]}
                />
                <ToolCard 
                  title="Tome"
                  description="AI-powered storytelling format that helps create visual narratives and presentations."
                  category="presentation"
                  url="https://tome.app/"
                  free={true}
                  proFeatures={[
                    "Narrative generation from prompts",
                    "Automatic image creation for slides",
                    "Dynamic page layouts",
                    "Collaborative editing features"
                  ]}
                />
                <ToolCard 
                  title="Slidesgo AI"
                  description="AI presentation generator that creates complete, customizable Google Slides and PowerPoint presentations."
                  category="presentation"
                  url="https://slidesgo.com/ai-presentations"
                  free={false}
                  proFeatures={[
                    "Complete presentation generation",
                    "Multiple design themes",
                    "Export to PowerPoint or Google Slides",
                    "Content suggestion for each slide"
                  ]}
                />
              </div>
            </TabsContent>
          </Tabs>
        </section>
        
        <section className="mt-16">
          <div className="bg-slate-100 dark:bg-slate-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">Need a Custom AI Solution?</h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              Our marketplace connects you with verified AI builders who can create personalized 
              solutions for your specific needs.
            </p>
            <Button size="lg" asChild>
              <Link href="/marketplace">
                Explore the Marketplace
              </Link>
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
