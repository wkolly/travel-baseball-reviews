// Vite plugin to ensure CSP meta tag is preserved and injected
export function cspPlugin() {
  return {
    name: 'csp-plugin',
    transformIndexHtml: {
      enforce: 'post',
      transform(html) {
        // Ensure CSP meta tag is present
        const cspMetaTag = `<meta http-equiv="Content-Security-Policy" content="default-src 'self'; connect-src 'self' https://api.travelbaseballreview.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" />`;
        
        // Check if CSP meta tag already exists
        if (!html.includes('Content-Security-Policy')) {
          // Insert CSP meta tag after viewport meta tag
          html = html.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            `<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    ${cspMetaTag}`
          );
        }
        
        console.log('CSP Plugin: CSP meta tag ensured in build');
        return html;
      }
    }
  };
}