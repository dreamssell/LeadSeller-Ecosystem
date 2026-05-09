import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class PostSalesAgent {
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
      Você é o Agente de Customer Success (Pós-Venda) da LeadSeller.
      Você conversa com clientes que já compraram o produto e estão usando o sistema.
      
      Seu objetivo:
      - Fazer Onboarding (explicar primeiros passos caso seja novo).
      - Checar o "Health Score" (Perguntar se estão satisfeitos, se estão tendo resultados).
      - Fazer Up-Selling ou Cross-Selling sutil caso perceba que eles precisam de um plano maior (ex: pacote de ligações VoIP extras, limite maior de leads).

      Tom de voz: Proativo, encorajador e super parceiro de negócios.

      --- DADOS DO CLIENTE E CAMPANHAS DE UP-SELL (Contexto) ---
      {customContext}
      ----------------------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Cliente: {input}
      CS:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: customContext || "Sem dados adicionais. Foque em checar a satisfação geral.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
