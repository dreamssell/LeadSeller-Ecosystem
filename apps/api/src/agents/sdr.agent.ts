import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { BaseMessage } from '@langchain/core/messages'; // Importe BaseMessage


import { createGoogleCalendarTool } from '../tools/calendar.tool';
import { TenantGoogleTokens } from '../integrations/google/google.service';

// Defina uma interface para a estrutura de uma ToolCall
interface ToolCall {
  id: string;
  name: string;
  args: Record<string, any>; // Ou um tipo mais específico se você souber a estrutura dos argumentos
  type: 'function'; // Adicionei 'type' com base na documentação do LangChain
}

// Defina uma interface para o tipo de retorno esperado da chain.invoke()
interface LLMToolResponse {
  content: string;
  tool_calls?: ToolCall[]; // tool_calls é opcional e é um array de ToolCall
  // Outras propriedades que o LLM possa retornar, como 'additional_kwargs', etc.
}

export class SDRAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  async processMessage(
    userMessage: string,
    customContext: string = "",
    tenantTokens: TenantGoogleTokens | null = null,
    chatHistory: any[] = []
  ) {

    const tools = [];
    if (tenantTokens) {
      tools.push(createGoogleCalendarTool(tenantTokens));
    }

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

    if (tools.length > 0) {
      const llmWithTools = this.llm.bindTools(tools);
      const chain = prompt.pipe(llmWithTools);

      // Aqui aplicamos o type assertion para informar ao TypeScript o tipo de 'result'
      const result = await chain.invoke({
        input: userMessage,
        customContext: customContext || "Não há arquivos de contexto adicional no momento. Use o padrão BANT.",
        chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
      }) as LLMToolResponse; // <--- Adicione 'as LLMToolResponse' aqui

      if (result.tool_calls && result.tool_calls.length > 0) {
        return `[FERRAMENTA INVOCADA PELA IA: ${result.tool_calls[0].name}] \nA IA decidiu agendar a call baseada nos dados do Lead. No ambiente real, a API do Google executaria agora.`;
      }

      return result.content;
    } else {
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