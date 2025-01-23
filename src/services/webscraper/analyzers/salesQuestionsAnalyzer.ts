import { getApiKey } from '../../apiKeys';

export async function generateSalesQuestions(service: string): Promise<string[]> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: "system",
          content: `You are a sales expert specializing in creating pain/gain discovery questions.

Guidelines for questions:
1. Focus on uncovering pain points and desired outcomes
2. Use psychology to make prospects think about their challenges
3. Follow SPIN selling methodology (Situation, Problem, Implication, Need-payoff)
4. Make questions specific to the service
5. Format as numbered instructions (e.g., "1. Find out how long they've been struggling with...")

Return exactly 3 questions, formatted as numbered instructions for an AI agent.`
        },
        {
          role: "user",
          content: `Create 3 strategic sales questions for: ${service}

Example format for fitness service:
1. Find out how long they've been working towards their fitness goal
2. Find out what they've tried before to lose weight
3. Find out what their #1 fitness goal is right now

Example format for solar service:
1. Find out how much they're spending on energy each month
2. Find out if they have a south-facing roof
3. Find out if they're more interested in saving money or being greener for the planet

Create 3 numbered questions specific to: ${service}`
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate sales questions');
  }

  const data = await response.json();
  const questions = data.choices[0].message.content
    .trim()
    .split('\n')
    .filter(q => q.trim());

  return questions;
}