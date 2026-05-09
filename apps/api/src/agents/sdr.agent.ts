import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';

import { createGoogleCalendarTool } from '../tools/calendar.tool';
import { TenantGoogleTokens } from '../integrations/google/google.service';

export class SDRAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    // Para usar tools com maestria, precisamos de um modelo poderoso (GPT-4o ou Claude 3.5 Sonnet)
    this.llm = LLMFactory.create(provider);
  }

  /**
   * Processa a mensagem do Lead com contexto customizado (RAG) e acesso a ferramentas
   */
  async processMessage(
    userMessage: string, 
    customContext: string = "", 
    tenantTokens: TenantGoogleTokens | null = null,
    chatHistory: any[] = []
  ) {
    
    // 1. Inicializar a ferramenta de calendário se o tenant tiver as credenciais vinculadas
    const tools = [];
    if (tenantTokens) {
      tools.push(createGoogleCalendarTool(tenantTokens));
    }

    // 2. O Prompt B2B BANT Base (Que aceita injeção de contexto customizado do cliente via RAG)
    const prompt = PromptTemplate.fromTemplate(`
      Você é um Vendedor Executivo (SDR) de alto nível da LeadSeller.
      Seu objetivo é qualificar o lead usando o framework BANT (Budget, Authority, Need, Timeline).
      
      Abordagem:
      - Seja consultivo, persuasivo e amigável.
      - Não faça todas as perguntas de uma vez. Faça uma por vez em um tom de conversa natural.
      - Se o Lead estiver qualificado (demonstrar dor clara e interesse urgênte), e VOCÊ TIVER ACESSO À FERRAMENTA DE AGENDAMENTO, use a ferramenta para agendar uma Reunião no Google Meet e envie o link para ele.

      --- CONTEXTO CUSTOMIZADO DO CLIENTE (Base de Conhecimento / Arquivos Uploaded) ---
      {customContext}
      ----------------------------------------------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Lead: {input}
      SDR:
    `);

    // 3. Montagem do Agente com Tool Calling
    if (tools.length > 0) {
      const llmWithTools = this.llm.bindTools(tools);
      const chain = prompt.pipe(llmWithTools);
      
      const result = await chain.invoke({
        input: userMessage,
        customContext: customContext || "Não há arquivos de contexto adicional no momento. Use o padrão BANT.",
        chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
      });

      if (result.tool_calls && result.tool_calls.length > 0) {
        return `[FERRAMENTA INVOCADA PELA IA: ${result.tool_calls[0].name}] \nA IA decidiu agendar a call baseada nos dados do Lead. No ambiente real, a API do Google executaria agora.`;
      }

      return result.content;
    } else {
      // Se não tem tools (cliente não vinculou o Google), usamos apenas uma chain normal
      const chain = prompt.pipe(this.llm);
      const result = await chain.invoke({
        input: userMessage,
        customContext: customContext || "Não há arquivos de contexto adicional no momento. Use o padrão BANT.",
        chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
      });
      
      return result.content;
    }
  }
}
