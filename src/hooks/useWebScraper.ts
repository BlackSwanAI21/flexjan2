import { useState } from 'react';
import { scrapeWebsiteContent } from '../services/webscraper/api';
import type { ScrapedData } from '../types/webscraper';

export function useWebScraper() {
  const [scrapedData, setScrapedData] = useState<ScrapedData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeWebsite = async (url: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await scrapeWebsiteContent(url);
      setScrapedData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to analyze website';
      setError(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    scrapedData,
    isLoading,
    error,
    scrapeWebsite
  };
}