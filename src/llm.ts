// Dependencies.
import OpenAI from 'openai';

// Environment.
import { Env } from './env';

// Types.
type SimpleMessageParam = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};
export type MessageParam = OpenAI.ChatCompletionMessageParam | SimpleMessageParam;

/**
 * Make a call to the LLM.
 *
 * Use the OpenAI API to chat with the GPT-4o-mini model, if the OpenAI API key is available.
 * Otherwise, use the Llama3.1-8b-instruct model by Cloudflare.
 *
 * @param messages the messages to be sent to the LLM
 * @param env the environment
 * @returns a message from the LLM
 */
export async function llm(messages: MessageParam[], env: Env) : Promise<MessageParam> {
  // Check if OpenAI API Key is available.
  if (env.OPENAI_API_KEY && typeof env.OPENAI_API_KEY === 'string' && env.OPENAI_API_KEY !== '') {
    // Try to make a call to the OpenAI API.
    try {
      // Initialize OpenAI.
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      // Call the OpenAI API.
      const chatCompletion = await openai.chat.completions.create({ model: 'gpt-4o-mini', messages: messages });
      const response = chatCompletion.choices[0].message;
      // Return the response.
      return response;

    } catch (error) {
      // Log the error.
      console.error('OpenAI API call failed:', error);
    }
  }

  // Use the Llama3.1-8b-instruct model by Cloudflare.
  const llamaResponse = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', { messages: messages });
  // Return the response.
  return { role: "assistant", content: llamaResponse.response };
}
