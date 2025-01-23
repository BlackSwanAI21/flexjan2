import { fetchWithProxy } from './proxy';
import { parseWebsiteContent } from './parser';
import { analyzeWebsiteContent } from './openai';
import { generateFAQs } from './analyzers/faqAnalyzer';
import type { ScrapedData } from '../../types/webscraper';

export async function scrapeWebsiteContent(url: string): Promise<ScrapedData & {
  country: string;
  industry: string;
  service: string;
  phone: string;
  openingTimes: string;
  faqs: { question: string; answer: string; }[];
}> {
  // Validate URL format
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(normalizedUrl);
  } catch {
    throw new Error('Invalid URL format. Please enter a valid website URL.');
  }

  try {
    // Fetch and parse website content
    const html = await fetchWithProxy(url);
    if (!html || typeof html !== 'string') {
      throw new Error('Failed to fetch website content. Please check if the URL is accessible.');
    }

    const parsedData = parseWebsiteContent(html);
    if (!parsedData) {
      throw new Error('Failed to parse website content. The website may be unavailable or in an unsupported format.');
    }

    // Run analyses in parallel with error handling
    const [gptAnalysis, faqs] = await Promise.all([
      analyzeWebsiteContent(html).catch(error => {
        console.error('GPT analysis error:', error);
        return {
          country: '',
          industry: '',
          service: parsedData.services[0] || '',
          phone: parsedData.contactInfo?.phone || '',
          openingTimes: ''
        };
      }),
      generateFAQs(html).catch(error => {
        console.error('FAQ generation error:', error);
        return [];
      })
    ]);

    // Merge data, preferring parsed data where available
    return {
      ...parsedData,
      country: gptAnalysis.country,
      industry: gptAnalysis.industry,
      service: gptAnalysis.service || parsedData.services[0] || '',
      phone: parsedData.contactInfo?.phone || gptAnalysis.phone,
      openingTimes: gptAnalysis.openingTimes,
      faqs,
      contactInfo: {
        ...parsedData.contactInfo,
        phone: parsedData.contactInfo?.phone || gptAnalysis.phone
      }
    };
  } catch (error) {
    // Improve error handling with specific error messages
    const errorMessage = error instanceof Error 
      ? error.message
      : 'An unexpected error occurred while analyzing the website.';
    
    console.error('Web scraper error:', { error, message: errorMessage });
    throw new Error(errorMessage);
  }
}