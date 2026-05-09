import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class AuditorAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  /**
   * Recebe o histórico completo (transcrição) de um atendimento humano ou de IA.
   */
  async auditConversation(transcript: string, rulesContext: string = "") {
    const prompt = PromptTemplate.fromTemplate(`
      Você é um Auditor de Qualidade (QA) de Vendas da LeadSeller.
      Sua missão é ler uma transcrição de atendimento de um vendedor (ou IA) e avaliá-la.
      
      Você deve gerar um laudo contendo:
      1. Nota Geral (de 0 a 10).
      2. Pontos Positivos.
      3. Pontos de Melhoria.
      4. O vendedor seguiu o framework de vendas (BANT, simpatia, clareza)?

      --- REGRAS DE AUDITORIA (Cultura da Empresa) ---
      {customContext}
      ------------------------------------------------

      TRANSCRIÇÃO DO ATENDIMENTO:
      {input}

      LAUDO DO AUDITOR:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: transcript,
      customContext: rulesContext || "Avaliar simpatia, uso do nome do cliente, e se tentou qualificar dor/urgência.",
    });

    return result;
  }
}
