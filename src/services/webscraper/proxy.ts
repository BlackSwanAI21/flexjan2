const PROXY_SERVICES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest='
];

export async function fetchWithProxy(url: string): Promise<string> {
  let lastError: Error | null = null;

  // Add protocol if missing
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  // Try each proxy service until one works
  for (const proxyUrl of PROXY_SERVICES) {
    try {
      const response = await fetch(`${proxyUrl}${encodeURIComponent(normalizedUrl)}`, {
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml',
          'User-Agent': 'Mozilla/5.0 (compatible; WebScraper/1.0)'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const text = await response.text();
      
      // Basic validation of HTML content
      if (!text || text.length < 100) {
        throw new Error('Invalid response: content too short');
      }
      
      return text;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      continue; // Try next proxy
    }
  }

  // All proxies failed
  throw new Error(`Failed to fetch website content: ${lastError?.message || 'Unknown error'}. Please check if the URL is accessible.`);
}