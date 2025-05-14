# Viewing Preferences Redesign

## Overview

This document describes the redesigned viewing preferences system for the BuildAppsWith platform. The implementation provides a simplified, user-friendly interface with three preset themes and customizable options for dark mode, font size, and reduced motion.

## Implementation Summary

### 1. Three Preset Themes

#### Standard Theme
- Default system fonts and colors
- Normal font sizing (100%)
- Default color scheme

#### Dyslexic-friendly Theme
- OpenDyslexic font family
- Reduced font size (90% by default)
- Optimized for readability

#### Cyber Punk Theme
- Monospace font (Courier New)
- Neon color scheme (green, pink, cyan)
- Dark background with glow effects
- Tech-inspired aesthetic

### 2. Additional Options

#### Dark Mode Toggle
- Separate from theme selection
- Works with all themes
- Persists across sessions

#### Font Size Slider
- Range: 70% to 130%
- 5% increments
- Defaults adjust based on theme selection
- Real-time preview

#### Reduced Motion
- Disables animations and transitions
- Improves accessibility
- System-wide effect

### 3. Technical Implementation

#### Component Structure
```tsx
interface PreferencesState {
  theme: "standard" | "dyslexic" | "cyberpunk";
  darkMode: boolean;
  fontSize: number; // 70-130 percentage
  reducedMotion: boolean;
}
```

#### CSS Architecture
```css
/* Theme classes */
.theme-standard { /* Default styles */ }
.theme-dyslexic { font-family: 'OpenDyslexic'; }
.theme-cyberpunk { /* Neon colors, monospace font */ }

/* Font scaling */
:root { --user-font-scale: 1; }
html { font-size: calc(16px * var(--user-font-scale)); }

/* Reduced motion */
.reduced-motion * {
  animation-duration: 0.01ms !important;
  transition-duration: 0.01ms !important;
}
```

### 4. User Interface

The viewing preferences are presented in a popover with two main sections:

1. **Theme Selection**
   - Three button cards with titles and descriptions
   - Visual feedback for active theme
   - Instant theme switching

2. **Additional Options**
   - Dark Mode: Toggle switch with sun/moon icons
   - Font Size: Slider with percentage display
   - Reduced Motion: Toggle switch with motion icon

## Usage

```tsx
import ViewingPreferences from "@/components/ui/viewing-preferences";

// Default variant
<ViewingPreferences />

// Icon variant (shows settings icon)
<ViewingPreferences variant="icon" />

// Minimal variant (shows "VP" badge)
<ViewingPreferences variant="minimal" />
```

## Testing

A comprehensive test page is available at `/test/dyslexic-mode` (no authentication required) that includes:

- Typography tests for all heading and text sizes
- Form element tests
- Color theme demonstrations
- Dark mode compatibility checks
- Font size scaling preview

## Browser Compatibility

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Uses CSS custom properties with fallbacks
- Smooth degradation for older browsers

## Accessibility

- All themes meet WCAG AA contrast standards
- Focus states clearly visible
- Reduced motion option for users with vestibular disorders
- Screen reader compatible
- Keyboard navigation supported

## Performance

- CSS-only theme switching (no JavaScript after initial load)
- Minimal reflow/repaint on theme changes
- LocalStorage persistence
- No external font downloads (except OpenDyslexic)

## Future Enhancements

1. Additional themes (High Contrast, Solarized, etc.)
2. Custom theme creator
3. Export/import preferences
4. Per-page overrides
5. System preference detection