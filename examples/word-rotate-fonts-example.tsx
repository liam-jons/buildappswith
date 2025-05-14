// Example usage of WordRotateWithFonts component
import { WordRotateWithFonts } from "@/components/magicui/word-rotate-with-fonts";

export function HeroWithCustomFonts() {
  const wordsWithFonts = [
    { 
      text: "Claude", 
      font: "Interceptor, sans-serif",
      className: "text-purple-600"
    },
    { 
      text: "ChatGPT", 
      font: "Inter, sans-serif",
      className: "text-green-600"
    },
    { 
      text: "Perplexity", 
      font: "Georgia, serif",
      className: "text-blue-600"
    },
    { 
      text: "Cursor", 
      font: "monospace",
      className: "text-orange-600"
    },
    { 
      text: "V0", 
      font: "Arial Black, sans-serif",
      className: "text-pink-600"
    }
  ];

  return (
    <div>
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold">
        Build apps with
      </h1>
      <WordRotateWithFonts
        words={wordsWithFonts}
        duration={2000}
        className="text-6xl md:text-7xl lg:text-8xl font-bold"
      />
    </div>
  );
}