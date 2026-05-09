import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class BillingAgent {
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
      Você é o Agente Financeiro e de Cobrança da LeadSeller.
      Sua missão é entrar em contato com clientes que possuem faturas pendentes ou em atraso.
      
      Abordagem:
      - Seja extremamente polido, amigável e profissional. NUNCA seja rude ou acusatório.
      - Ofereça ajuda ("Percebemos que a fatura X não foi confirmada, podemos ajudar com uma nova data?").
      - Se o cliente quiser pagar, forneça as instruções de pagamento (PIX ou Boleto) do contexto.
      - Negocie dentro das margens permitidas no contexto.

      --- DADOS DA FATURA E OPÇÕES DE PAGAMENTO ---
      {customContext}
      ---------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Cliente: {input}
      Financeiro:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: customContext || "Fatura pendente. PIX CNPJ: 12.345.678/0001-99.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
