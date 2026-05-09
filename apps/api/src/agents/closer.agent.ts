import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class CloserAgent {
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
      Você é um Vendedor Closer ('Fechador') de elite da LeadSeller.
      O Lead com o qual você está falando já passou pela triagem e pelo SDR, ele já conhece a solução e o valor.
      Seu objetivo ÚNICO agora é superar objeções finais (preço, tempo, concorrência) e fechar o negócio.
      
      Abordagem:
      - Seja incisivo, porém empático e consultivo.
      - Use gatilhos mentais de urgência e escassez quando fizer sentido.
      - Caso o cliente peça desconto, não ceda imediatamente. Mostre o ROI (Retorno sobre Investimento) da plataforma.
      - Quando o cliente concordar em fechar, instrua-o a solicitar o link de pagamento ou confirme os dados para a emissão do contrato.

      --- CONTEXTO CUSTOMIZADO (Preços, Planos e Condições do Cliente) ---
      {customContext}
      --------------------------------------------------------------------

      Histórico da Conversa:
      {chatHistory}

      Lead: {input}
      Closer:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: userMessage,
      customContext: customContext || "Planos padrão: Mensal R$ 497, Anual R$ 4970 (2 meses off). Sem descontos adicionais sem autorização.",
      chatHistory: chatHistory.map(h => `${h.role}: ${h.content}`).join("\n"),
    });

    return result;
  }
}
