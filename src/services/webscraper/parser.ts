import type { ScrapedData } from '../../types/webscraper';

export function parseWebsiteContent(html: string): ScrapedData {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract company name
    const companyName = extractCompanyName(doc);

    // Extract description
    const description = extractDescription(doc);

    // Extract services
    const services = extractServices(doc);

    // Extract contact info
    const contactInfo = extractContactInfo(doc);

    return {
      companyName,
      description,
      services,
      contactInfo
    };
  } catch (error) {
    console.error('Error parsing website content:', error);
    throw new Error('Failed to analyze website content. The page may be unavailable or in an unsupported format.');
  }
}

function extractCompanyName(doc: Document): string {
  // Try multiple selectors to find company name
  const selectors = [
    'meta[property="og:site_name"]',
    'meta[name="application-name"]',
    '.logo img[alt]',
    'header .logo',
    '#logo'
  ];

  for (const selector of selectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const name = element.getAttribute('content') || 
                   element.getAttribute('alt') || 
                   element.textContent;
      if (name?.trim()) return name.trim();
    }
  }

  // Fallback to title
  const title = doc.querySelector('title')?.textContent;
  if (title) {
    // Remove common suffixes
    return title.split(/[-|]/)[0].trim();
  }

  return 'Unknown Company';
}

function extractDescription(doc: Document): string {
  // Try meta descriptions first
  const metaDesc = doc.querySelector('meta[name="description"]')?.getAttribute('content') ||
                  doc.querySelector('meta[property="og:description"]')?.getAttribute('content');
  
  if (metaDesc?.trim()) return metaDesc.trim();

  // Look for main content areas
  const contentSelectors = [
    'main p',
    'article p',
    '.content p',
    '#content p'
  ];

  for (const selector of contentSelectors) {
    const paragraphs = Array.from(doc.querySelectorAll(selector))
      .map(p => p.textContent?.trim())
      .filter(text => text && text.length > 50);

    if (paragraphs.length > 0) {
      return paragraphs[0];
    }
  }

  return 'No description available';
}

function extractServices(doc: Document): string[] {
  const services = new Set<string>();
  
  // Common service section identifiers
  const serviceIdentifiers = [
    'services',
    'solutions',
    'products',
    'offerings',
    'what-we-do',
    'capabilities'
  ];

  // Look for sections with service-related IDs or classes
  serviceIdentifiers.forEach(identifier => {
    doc.querySelectorAll(`[id*="${identifier}"], [class*="${identifier}"]`)
      .forEach(section => {
        const items = section.querySelectorAll('h3, h4, li');
        items.forEach(item => {
          const text = item.textContent?.trim();
          if (text && text.length > 5 && text.length < 100) {
            services.add(text);
          }
        });
      });
  });

  // If no services found, try to extract from lists
  if (services.size === 0) {
    doc.querySelectorAll('ul li, ol li').forEach(item => {
      const text = item.textContent?.trim();
      if (text && text.length > 5 && text.length < 100) {
        services.add(text);
      }
    });
  }

  return Array.from(services).slice(0, 5);
}

function extractContactInfo(doc: Document): { phone?: string; email?: string } {
  const contactInfo: { phone?: string; email?: string } = {};

  // Phone patterns for different formats
  const phonePatterns = [
    /(\+?1[-.]?)?\s*\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
    /\+\d{1,4}[-.\s]?\d{2,3}[-.\s]?\d{2,3}[-.\s]?\d{2,4}/,
    /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/
  ];

  // Look for phone numbers in contact sections first
  const contactSections = doc.querySelectorAll('[id*="contact"], [class*="contact"]');
  for (const section of contactSections) {
    const text = section.textContent || '';
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        contactInfo.phone = match[0];
        break;
      }
    }
    if (contactInfo.phone) break;
  }

  // If no phone found in contact sections, try the whole document
  if (!contactInfo.phone) {
    const text = doc.body.textContent || '';
    for (const pattern of phonePatterns) {
      const match = text.match(pattern);
      if (match) {
        contactInfo.phone = match[0];
        break;
      }
    }
  }

  // Extract email
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  // Try mailto links first
  const mailtoLinks = doc.querySelectorAll('a[href^="mailto:"]');
  for (const link of mailtoLinks) {
    const href = link.getAttribute('href');
    if (href) {
      contactInfo.email = href.replace('mailto:', '');
      break;
    }
  }

  // If no mailto links, try finding email in text
  if (!contactInfo.email) {
    const text = doc.body.textContent || '';
    const match = text.match(emailPattern);
    if (match) {
      contactInfo.email = match[0];
    }
  }

  return contactInfo;
}