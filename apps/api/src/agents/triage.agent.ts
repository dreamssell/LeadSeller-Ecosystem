import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class TriageAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  async processMessage(userMessage: string, context?: any) {
    const prompt = PromptTemplate.fromTemplate(`
      Você é um agente de triagem inteligente da LeadSeller.
      Sua função é ler a mensagem do cliente e decidir para qual departamento ela deve ir.
      
      Regras:
      1. Se o cliente falar sobre vendas, comprar, preços, planos, responda "SDR".
      2. Se o cliente falar sobre problemas, não consigo acessar, erro, suporte, responda "SUPPORT".
      3. Caso contrário, responda "UNKNOWN".

      Responda APENAS com uma dessas três palavras (SDR, SUPPORT, UNKNOWN).

      Mensagem do Cliente: {message}
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      message: userMessage,
    });

    return result.trim().toUpperCase();
  }
}
