"use client";

import ViewingPreferences from "@/components/platform/viewing-preferences";
import { useState } from "react";

export default function DyslexicModeTestPage() {
  const [testState, setTestState] = useState({
    mounted: false,
    lastAction: "Page loaded"
  });

  return (
    <div className="min-h-screen p-8">
      {/* Test Navigation Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">Dyslexic Mode Test Page</h1>
          <ViewingPreferences />
        </div>
        <p className="text-sm text-muted-foreground">
          Last action: {testState.lastAction}
        </p>
      </header>

      {/* Test Content Sections */}
      <main className="space-y-8">
        {/* Typography Test */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Typography Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-2xl font-medium">Headings</h3>
              <h1 className="text-4xl">H1 Heading</h1>
              <h2 className="text-3xl">H2 Heading</h2>
              <h3 className="text-2xl">H3 Heading</h3>
              <h4 className="text-xl">H4 Heading</h4>
              <h5 className="text-lg">H5 Heading</h5>
              <h6 className="text-base">H6 Heading</h6>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-medium">Text Sizes</h3>
              <p className="text-xs">Extra small text (text-xs)</p>
              <p className="text-sm">Small text (text-sm)</p>
              <p className="text-base">Base text (text-base)</p>
              <p className="text-lg">Large text (text-lg)</p>
              <p className="text-xl">Extra large text (text-xl)</p>
              <p className="text-2xl">2x large text (text-2xl)</p>
            </div>
          </div>
        </section>

        {/* Color Test */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Color Theme Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-lg border">
              <h3 className="font-medium mb-2">Claude Theme</h3>
              <p className="text-sm">Cream background with soft text</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="font-medium mb-2">High Contrast</h3>
              <p className="text-sm">Maximum contrast for clarity</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="font-medium mb-2">Warm Colors</h3>
              <p className="text-sm">Warm, comfortable tones</p>
            </div>
            <div className="p-6 rounded-lg border">
              <h3 className="font-medium mb-2">Cool Colors</h3>
              <p className="text-sm">Cool, calming tones</p>
            </div>
          </div>
        </section>

        {/* Form Elements Test */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Form Elements Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="test-input" className="block text-sm font-medium mb-2">
                  Text Input
                </label>
                <input
                  id="test-input"
                  type="text"
                  placeholder="Enter text here"
                  className="w-full px-4 py-2 rounded border"
                />
              </div>
              <div>
                <label htmlFor="test-textarea" className="block text-sm font-medium mb-2">
                  Textarea
                </label>
                <textarea
                  id="test-textarea"
                  placeholder="Enter longer text here"
                  rows={4}
                  className="w-full px-4 py-2 rounded border"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="test-select" className="block text-sm font-medium mb-2">
                  Select
                </label>
                <select
                  id="test-select"
                  className="w-full px-4 py-2 rounded border"
                >
                  <option>Option 1</option>
                  <option>Option 2</option>
                  <option>Option 3</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Buttons</label>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded bg-primary text-primary-foreground">
                    Primary
                  </button>
                  <button className="px-4 py-2 rounded bg-secondary text-secondary-foreground">
                    Secondary
                  </button>
                  <button className="px-4 py-2 rounded border">
                    Outline
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content Blocks Test */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Content Blocks Test</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <article className="p-6 rounded-lg border">
              <h3 className="text-xl font-medium mb-2">Article 1</h3>
              <p className="text-sm mb-4">
                This is a sample article to test how content appears with different
                dyslexic mode settings. The text should be readable and comfortable
                in all themes.
              </p>
              <p className="text-xs text-muted-foreground">
                Published on January 14, 2025
              </p>
            </article>
            <article className="p-6 rounded-lg border">
              <h3 className="text-xl font-medium mb-2">Article 2</h3>
              <p className="text-sm mb-4">
                Another sample article with different content. Pay attention to
                spacing, contrast, and font rendering when switching between
                different modes.
              </p>
              <p className="text-xs text-muted-foreground">
                Published on January 14, 2025
              </p>
            </article>
            <article className="p-6 rounded-lg border">
              <h3 className="text-xl font-medium mb-2">Article 3</h3>
              <p className="text-sm mb-4">
                The third article demonstrates consistent styling across all
                dyslexic mode variations. Notice how colors adapt to each theme.
              </p>
              <p className="text-xs text-muted-foreground">
                Published on January 14, 2025
              </p>
            </article>
          </div>
        </section>

        {/* Test Checklist */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Test Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="text-xl font-medium mb-4">Individual Toggles</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test OpenDyslexic font only</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test font size adjustment only</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test dyslexic colors only</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test all toggles combined</span>
              </label>
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-medium mb-4">Preset Themes</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test Claude-inspired theme</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test High Contrast theme</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test Warm Colors theme</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span>Test Cool Colors theme</span>
              </label>
            </div>
          </div>
        </section>

        {/* Dark Mode Compatibility */}
        <section className="space-y-4">
          <h2 className="text-3xl font-semibold">Dark Mode Compatibility</h2>
          <p className="text-lg">
            Test each combination in both light and dark modes to ensure proper
            contrast and readability.
          </p>
          <div className="p-6 rounded-lg border">
            <h3 className="text-xl font-medium mb-2">Current Mode</h3>
            <p>Toggle dark mode to see how dyslexic themes adapt</p>
          </div>
        </section>
      </main>
    </div>
  );
}