import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class DataAnalystAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  /**
   * No futuro, este agente pode usar Tools para rodar SQL diretamente no Supabase.
   * Por enquanto, ele recebe os relatórios injetados e responde em linguagem natural.
   */
  async processMessage(
    userMessage: string, 
    metricsContext: string = "", 
    chatHistory: any[] = []
  ) {
    const prompt = PromptTemplate.fromTemplate(`
      Você é um Analista de Dados Sênior focado em CRM (LeadSeller).
      Você responde perguntas exclusivas do DONO ou GERENTE da empresa.
      
      Sua missão:
      - Interpretar os dados brutos e relatórios que você recebe no contexto.
      - Responder às dúvidas do gerente de forma analítica, trazendo insights e conclusões de negócios.
      - Falar de forma executiva e direta (como um Dashboard em forma de texto).

      --- MÉTRICAS E DADOS DO CRM (Extraídos do Banco de Dados) ---
      {customContext}
      -------------------------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Gerente: {input}
      Analista:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: metricsContext || "Tivemos 50 novos leads. 10 agendamentos. 2 fechamentos. Taxa de conversão: 4%.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
