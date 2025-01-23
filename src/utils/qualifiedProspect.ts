import { generateSalesQuestions } from '../services/webscraper/analyzers/salesQuestionsAnalyzer';

export async function generateQualifiedProspectQuestions(service: string): Promise<string> {
  try {
    const salesQuestions = await generateSalesQuestions(service);
    
    // Add the initial message with dynamic service
    const initialMessage = `START: Your first response should always say "Ok, my manager asked me to reach out but I hate annoying people with unwanted phone calls are you still interested in ${service}"\n\n`;
    
    // Combine initial message with sales questions
    return initialMessage + salesQuestions.join('\n');
  } catch (error) {
    console.error('Error generating qualified prospect questions:', error);
    return '';
  }
}