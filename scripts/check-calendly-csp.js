// Check if we have CSP issues with Calendly

// Run this in the browser console to check for CSP violations
console.log('Checking for Content Security Policy issues...');

// Check if Calendly script is loaded
const calendlyScript = document.querySelector('script[src*="calendly.com"]');
console.log('Calendly script element:', calendlyScript);

// Check if window.Calendly exists
console.log('window.Calendly:', window.Calendly);

// Try to manually load the script
const script = document.createElement('script');
script.src = 'https://assets.calendly.com/assets/external/widget.js';
script.onload = () => {
  console.log('Manually loaded script - window.Calendly:', window.Calendly);
};
script.onerror = (error) => {
  console.error('Failed to load Calendly script:', error);
};
document.head.appendChild(script);

// Check for CSP headers
console.log('To check CSP headers, look in Network tab for the main page request and check the response headers for Content-Security-Policy');

// Alternative approach - create inline widget manually
setTimeout(() => {
  if (window.Calendly) {
    const testDiv = document.createElement('div');
    testDiv.className = 'calendly-inline-widget';
    testDiv.style.height = '400px';
    testDiv.style.width = '400px';
    testDiv.style.border = '1px solid red';
    document.body.appendChild(testDiv);
    
    try {
      window.Calendly.initInlineWidget({
        url: 'https://calendly.com/liam-buildappswith/getting-started-businesses',
        parentElement: testDiv
      });
      console.log('Manual widget creation successful');
    } catch (error) {
      console.error('Manual widget creation failed:', error);
    }
  } else {
    console.log('Calendly still not available after manual script load');
  }
}, 2000);