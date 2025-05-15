// Debug script to understand Calendly embed issue

// The error we're seeing:
// Uncaught TypeError: null has no properties
// parseOptions https://assets.calendly.com/assets/external/widget.js:1

// This typically means the Calendly widget is trying to parse options from a null value
// Most likely the issue is one of:
// 1. The embed element doesn't exist when initInlineWidget is called
// 2. The URL format is incorrect
// 3. Missing required parameters

// Let's create a test HTML file to verify the correct format:

const fs = require('fs');

const testHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Calendly Widget Test</title>
    <script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript"></script>
</head>
<body>
    <h1>Calendly Widget Test</h1>
    
    <div id="test1" style="height: 600px; border: 1px solid #ccc; margin: 20px;">
        <h2>Test 1: Full URL</h2>
        <div class="calendly-inline-widget" id="embed1" style="height: 100%;"></div>
    </div>
    
    <div id="test2" style="height: 600px; border: 1px solid #ccc; margin: 20px;">
        <h2>Test 2: Event Type Only</h2>
        <div class="calendly-inline-widget" id="embed2" style="height: 100%;"></div>
    </div>
    
    <script>
        // Wait for Calendly to load
        window.addEventListener('load', function() {
            console.log('Calendly available:', !!window.Calendly);
            
            // Test 1: Full URL (what we have in the database)
            const embed1 = document.getElementById('embed1');
            if (embed1 && window.Calendly) {
                try {
                    window.Calendly.initInlineWidget({
                        url: 'https://calendly.com/liam-buildappswith/getting-started-businesses',
                        parentElement: embed1,
                        prefill: {
                            name: 'Test User',
                            email: 'test@example.com'
                        }
                    });
                    console.log('Test 1 initialized successfully');
                } catch (error) {
                    console.error('Test 1 error:', error);
                }
            }
            
            // Test 2: Different format
            const embed2 = document.getElementById('embed2');
            if (embed2 && window.Calendly) {
                try {
                    window.Calendly.initInlineWidget({
                        url: 'https://calendly.com/liam-buildappswith/getting-started-individuals',
                        parentElement: embed2
                    });
                    console.log('Test 2 initialized successfully');
                } catch (error) {
                    console.error('Test 2 error:', error);
                }
            }
        });
    </script>
</body>
</html>
`;

// Write test file
fs.writeFileSync('calendly-test.html', testHTML);
console.log('Created calendly-test.html - open this in a browser to test');

// Also let's create a quick check on the component
console.log('\n=== CalendlyEmbed Component Debug Suggestions ===\n');
console.log('1. Check if embedRef.current is null when initCalendly is called');
console.log('2. Verify window.Calendly exists when trying to initialize');
console.log('3. Check the exact URL format being passed');
console.log('4. Verify parentElement is a valid DOM element');
console.log('\nAdd these debug logs to calendly-embed.tsx:');
console.log(`
const initCalendly = () => {
  console.log('initCalendly called', {
    hasRef: !!embedRef.current,
    hasCalendly: !!window.Calendly,
    isScriptLoaded,
    url
  });
  
  if (!embedRef.current || !window.Calendly || !isScriptLoaded) {
    console.log('Calendly init skipped:', { 
      hasRef: !!embedRef.current, 
      hasCalendly: !!window.Calendly, 
      isScriptLoaded,
      refDetails: embedRef.current 
    });
    return;
  }
  
  console.log('Initializing Calendly with:', {
    url,
    parentElement: embedRef.current,
    prefill: prefillData,
    utm: utmParamsObject
  });
  
  try {
    window.Calendly.initInlineWidget({
      url: url,
      parentElement: embedRef.current,
      prefill: prefillData,
      utm: utmParamsObject
    });
    console.log('Calendly initialized successfully');
  } catch (error) {
    console.error('Calendly initialization error:', error);
  }
}
`);