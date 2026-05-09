import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';

export type LLMProvider = 'openai' | 'anthropic';

export class LLMFactory {
  static create(provider: LLMProvider = 'openai') {
    switch (provider) {
      case 'openai':
        return new ChatOpenAI({
          modelName: 'gpt-4o',
          temperature: 0.7,
        });
      case 'anthropic':
        return new ChatAnthropic({
          modelName: 'claude-3-5-sonnet-20240620',
          temperature: 0.7,
        });
      default:
        throw new Error(`Provider ${provider} is not supported.`);
    }
  }
}
