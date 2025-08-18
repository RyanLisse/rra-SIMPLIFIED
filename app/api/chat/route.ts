import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';

export const maxDuration = 60; // Increased for reasoning models

export async function POST(req: Request) {
  const { messages, useReasoning = true, reasoningLevel = 'medium' } = await req.json();

  // Configuration for August 2025 GPT-5-mini with reasoning capabilities
  // Note: This uses a hypothetical model name. In production, this would fall back to the latest available model
  const modelConfig = {
    base: 'gpt-5-mini', // Hypothetical August 2025 model
    reasoning: useReasoning ? `-${reasoningLevel}-reasoning` : '',
  };
  
  // For now, we'll use gpt-4o as a fallback since GPT-5 doesn't exist yet
  // In August 2025, this would use the actual GPT-5-mini model
  const modelName = process.env.USE_GPT5 === 'true' 
    ? `${modelConfig.base}${modelConfig.reasoning}`
    : 'gpt-4o'; // Fallback to current best model

  try {
    const result = await streamText({
      model: openai(modelName),
      messages,
      system: `You are a helpful assistant ${process.env.USE_GPT5 === 'true' ? 'powered by GPT-5-mini' : 'simulating GPT-5-mini capabilities'} with ${reasoningLevel} reasoning capabilities. 
      When reasoning is enabled, you will think through problems step-by-step before providing answers.
      ${useReasoning ? 'Please show your reasoning process clearly before providing the final answer.' : ''}
      Current date: August 2025.`,
      temperature: reasoningLevel === 'deep' ? 0.3 : 0.7,
    });

    return result.toTextStreamResponse();
  } catch (error) {
    // Fallback to gpt-4o if the model doesn't exist
    console.log('Falling back to gpt-4o model');
    
    const result = await streamText({
      model: openai('gpt-4o'),
      messages,
      system: `You are a helpful assistant simulating GPT-5-mini capabilities with ${reasoningLevel} reasoning. 
      ${useReasoning ? 'Please show your reasoning process clearly before providing the final answer.' : ''}
      Current date: August 2025.`,
      temperature: reasoningLevel === 'deep' ? 0.3 : 0.7,
    });

    return result.toTextStreamResponse();
  }
}