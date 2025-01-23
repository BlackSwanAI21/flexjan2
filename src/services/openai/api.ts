import OpenAI from 'openai';

export async function analyzeAgentObjective(apiKey: string, agentPrompt: string): Promise<string> {
  const openai = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true 
  });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert at analyzing AI agent prompts. Your task is to extract and concisely describe what the agent is trying to achieve and in what industry. Format your response as a single sentence that completes this phrase: 'to [action] in the [industry] industry'. For example: 'to book a sales call in the solar panel industry' or 'to collect PCP refund claims in the automotive finance industry'."
      },
      {
        role: "user",
        content: `Analyze this AI agent prompt and tell me its core objective and industry:\n\n${agentPrompt}`
      }
    ],
    temperature: 0.3,
    max_tokens: 100
  });

  return response.choices[0].message.content || '';
}

export async function identifyComplianceBody(apiKey: string, agentPrompt: string): Promise<string> {
  const openai = new OpenAI({ 
    apiKey,
    dangerouslyAllowBrowser: true 
  });
  
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are an expert at identifying relevant regulatory bodies and compliance frameworks. Based on the industry and context, identify the most relevant governing compliance body or regulatory framework. Output should be a concise name, e.g., 'FCA (Financial Conduct Authority)', 'GDPR', 'HIPAA', etc."
      },
      {
        role: "user",
        content: `Analyze this AI agent prompt and identify the most relevant compliance body or regulatory framework:\n\n${agentPrompt}`
      }
    ],
    temperature: 0.3,
    max_tokens: 100
  });

  return response.choices[0].message.content || '';
}

export async function generateModerationPrompt(
  apiKey: string,
  objective: string,
  moderationLevel: 'light' | 'medium' | 'compliant',
  complianceBody?: string
): Promise<string> {
  // Template for light moderation
  const lightTemplate = `Your Job is to monitor a conversation between an AI agent & person. You will grade person's response for general sentiment & engagement level. The ultimate objective is ${objective}.

Grading system:
Please grade using single digits 1 - 10
1- 4 = Generally negative response (if they appear skeptical this isn't negative)
5-6 = Neutral or uncertain response
7-10 = Positive engagement

Note: You will be provided a transcript of the full conversation in the user message box. System Messages can be ignored in your analysis.

Output style: Provide a number (1-10) followed by a pipe and a brief observation of why you've chosen this. Example output: 1 | user appears angered.
Here is the text to analyse:`;

  // Template for medium moderation
  const mediumTemplate = `Your Job is to monitor a conversation between an AI agent & person. You will grade person's response for both sentiment analysis & willingness to engage in the subject. The ultimate objective of the AI agent is to ${objective}

Grading system:
Please grade using single digits 1 - 10. 1 = person is angered | 3= person already has the product, or it's the wrong number, or doesn't want help right now | 4 - netral response but doesn't need help | 5 = Neutral response from person | 10 = person is engaging and is interested in the service promoted.

Note: You will be provided a transcript of the full conversation in the user message box. Occasionally, you will notice person responding with a 'System Message', ignore this in your analysis.

Output style: Output a number first followed by a '|' then a short reason for your answer e.g. 1 | person appeared angry we were messaging him
Here is the text to analyse:`;

  // Template for compliance moderation
  const complianceTemplate = (body: string) => `Your Job is to monitor a conversation between an AI agent & person. You will grade person's response for both sentiment analysis, willingness to engage in the subject, and compliance adherence. The ultimate objective of the AI agent is to ${objective} whilst messages should remain compliant with ${body}.

Sentiment Grading:
Please grade using single digits 1 - 10. 1 = person is angered | 3= person already has the product, or it's the wrong number, or doesn't want help right now | 4 - netral response but doesn't need help | 5 = Neutral response from person | 10 = person is engaging and is interested in the service promoted.
Compliance Grading:
Please grade using single digits 1 - 10
1-3 = Major compliance violations found
4-7 = Minor compliance concerns or missing elements
8-10 = Fully compliant with ${body}

Note: You will be provided a transcript of the full conversation in the user message box. Occasionally, you will notice person responding with a 'System Message', ignore this in your analysis.

Output style:
Sentiment Score: [1-10] | [reason]
Compliance Score: [1-10] | [specific compliance issues or confirmation of compliance]
Here is the text to analyse:`;

  if (moderationLevel === 'light') return lightTemplate;
  if (moderationLevel === 'medium') return mediumTemplate;
  if (moderationLevel === 'compliant' && !complianceBody) throw new Error('Compliance body is required for compliance moderation level');
  return complianceTemplate(complianceBody!);
} 