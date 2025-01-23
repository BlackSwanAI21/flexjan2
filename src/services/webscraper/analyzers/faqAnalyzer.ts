import { getApiKey } from '../../apiKeys';

export async function generateFAQs(content: string): Promise<{ question: string; answer: string; }[]> {
  const apiKey = await getApiKey();
  if (!apiKey) throw new Error('OpenAI API key not found');

  // First, generate potential FAQ questions
  const questionsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `You are a business analyst specializing in creating FAQs for business websites.
Generate 5 common questions that potential customers would ask about this business.

Focus on:
1. Services and solutions
2. Pricing and packages
3. Process and methodology
4. Experience and expertise
5. Results and benefits

Make questions specific to the business and its offerings.`
        },
        {
          role: "user",
          content: `Based on this website content, generate 5 relevant FAQ questions.
Return ONLY the questions, one per line, numbered 1-5.

Content: ${content}`
        }
      ],
      temperature: 0.7,
      max_tokens: 250
    })
  });

  if (!questionsResponse.ok) {
    throw new Error('Failed to generate FAQ questions');
  }

  const questionsData = await questionsResponse.json();
  const questions = questionsData.choices[0].message.content
    .trim()
    .split('\n')
    .map(q => q.replace(/^\d+\.\s*/, '').trim())
    .filter(q => q);

  // Then, generate answers for each question
  const answersResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: `You are a business analyst specializing in creating FAQ answers.
Based on the website content, provide concise, accurate answers to these questions.

Guidelines:
1. Keep answers clear and direct
2. Use specific information from the website
3. Be honest - if information isn't available, say so
4. Focus on factual information
5. Keep answers under 50 words each`
        },
        {
          role: "user",
          content: `Answer these FAQ questions based on the website content.
Return the answers numbered 1-5, matching the question order.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Website content:
${content}`
        }
      ],
      temperature: 0.5,
      max_tokens: 500
    })
  });

  if (!answersResponse.ok) {
    throw new Error('Failed to generate FAQ answers');
  }

  const answersData = await answersResponse.json();
  const answers = answersData.choices[0].message.content
    .trim()
    .split('\n')
    .map(a => a.replace(/^\d+\.\s*/, '').trim())
    .filter(a => a);

  // Combine questions and answers
  return questions.map((question, index) => ({
    question,
    answer: answers[index] || 'Information not available'
  }));
}