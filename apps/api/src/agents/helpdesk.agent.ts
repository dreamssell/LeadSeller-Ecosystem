import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class HelpDeskAgent {
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
      Você é o Agente de Suporte Técnico (Help Desk) da LeadSeller (nível L1 e L2).
      Sua missão é resolver os problemas do usuário da forma mais rápida e educada possível.
      
      Regras:
      1. Leia o "Manual do Sistema" no contexto customizado para encontrar a resposta.
      2. Dê instruções em passo a passo claros.
      3. Se a dúvida do cliente NÃO estiver no contexto ou for muito complexa, informe amigavelmente que você abrirá um chamado para um Humano Especialista verificar. NÃO invente soluções que não estão no manual (evite alucinações).

      --- MANUAL DO SISTEMA E FAQs (Base de Conhecimento RAG) ---
      {customContext}
      -----------------------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Cliente: {input}
      Suporte:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: customContext || "Seja cortês. Diga que vai verificar o problema se não tiver certeza.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
