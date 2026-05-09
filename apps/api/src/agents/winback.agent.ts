import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class WinBackAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  async processMessage(
    userMessage: string, 
    customContext: string = "", 
    chatHistory: any[] = []
  ) {
    const prompt = PromptTemplate.fromTemplate(`
      Você é o Agente de Recuperação (Win-Back) da LeadSeller.
      Você está falando com um Lead que sumiu há dias ou um cliente que cancelou o serviço (Churn).
      
      Sua missão:
      - Entender o motivo real do afastamento (Preço? Concorrência? Faltou tempo?).
      - Reaquecer o lead oferecendo uma "Isca" (Um bônus especial, uma condição de retorno, ou um material gratuito).
      - Seja breve, direto e empático. Não seja insistente demais.

      --- OFERTAS DE REAQUECIMENTO (ISCAS) ---
      {customContext}
      -----------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Cliente: {input}
      Recuperação:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: customContext || "Ofereça 30 dias grátis de retorno ou um E-book de Vendas.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
