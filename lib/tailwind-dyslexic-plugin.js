const plugin = require('tailwindcss/plugin');

module.exports = plugin(function({ addVariant, addUtilities, theme }) {
  // Add dyslexic variants
  addVariant('dyslexic-font', '.dyslexic-font &');
  addVariant('dyslexic-size', '.dyslexic-size &');
  addVariant('dyslexic-colors', '.dyslexic-colors &');
  
  // Add preset variants
  addVariant('dyslexic-claude', '.dyslexic-claude &');
  addVariant('dyslexic-contrast', '.dyslexic-contrast &');
  addVariant('dyslexic-warm', '.dyslexic-warm &');
  addVariant('dyslexic-cool', '.dyslexic-cool &');
  
  // Add dyslexic utilities
  addUtilities({
    '.dyslexic-bg': {
      backgroundColor: 'var(--dyslexic-bg)',
    },
    '.dyslexic-text': {
      color: 'var(--dyslexic-text)',
    },
    '.dyslexic-scale': {
      fontSize: 'calc(1em * var(--dyslexic-font-scale))',
    },
    '.dyslexic-transition': {
      transition: 'background-color 0.3s ease, color 0.3s ease, font-size 0.3s ease',
    },
  });
  
  // Add dyslexic-aware text utilities
  addUtilities({
    '.dyslexic-h1': {
      '@apply text-4xl font-bold dyslexic-font:dyslexic-scale dyslexic-colors:dyslexic-text': {},
    },
    '.dyslexic-h2': {
      '@apply text-3xl font-semibold dyslexic-font:dyslexic-scale dyslexic-colors:dyslexic-text': {},
    },
    '.dyslexic-h3': {
      '@apply text-2xl font-medium dyslexic-font:dyslexic-scale dyslexic-colors:dyslexic-text': {},
    },
    '.dyslexic-p': {
      '@apply text-base dyslexic-font:dyslexic-scale dyslexic-colors:dyslexic-text': {},
    },
  });
  
  // Add responsive dyslexic utilities
  addUtilities({
    '.dyslexic-container': {
      '@apply container dyslexic-colors:dyslexic-bg dyslexic-colors:dyslexic-text dyslexic-transition': {},
    },
    '.dyslexic-card': {
      '@apply rounded-lg p-6 dyslexic-colors:dyslexic-bg dyslexic-colors:dyslexic-text dyslexic-transition shadow-sm': {},
    },
    '.dyslexic-button': {
      '@apply px-4 py-2 rounded-md dyslexic-colors:dyslexic-bg dyslexic-colors:dyslexic-text dyslexic-transition hover:opacity-90': {},
    },
  });
});