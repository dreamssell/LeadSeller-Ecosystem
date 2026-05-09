import { LLMFactory, LLMProvider } from './llm.factory';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

export class NurtureAgent {
  private llm;

  constructor(provider: LLMProvider = 'openai') {
    this.llm = LLMFactory.create(provider);
  }

  async processMessage(
    leadContext: string, 
    contentMaterial: string = ""
  ) {
    const prompt = PromptTemplate.fromTemplate(`
      Você é um Especialista de Inbound Marketing da LeadSeller (Agente de Nutrição).
      Sua missão é gerar UMA ÚNICA mensagem de WhatsApp para nutrir um lead que ainda não está pronto para comprar.
      
      Diretrizes:
      - Seja super casual, parecendo uma mensagem enviada manualmente por um humano (ex: "Fala João, tudo bem? Lembrei de você hoje pq vi isso aqui...").
      - Use o material de conteúdo para entregar valor (uma dica, um case de sucesso, um artigo).
      - Não tente vender o produto agressivamente. O objetivo é manter o lead lembrando da marca e educá-lo sobre o problema dele.

      --- MATERIAL DE CONTEÚDO PARA ENVIAR (Dica da Semana) ---
      {contentMaterial}
      ---------------------------------------------------------

      Dados do Lead:
      {input}

      GERE A MENSAGEM DO WHATSAPP AQUI:
    `);

    const chain = prompt.pipe(this.llm).pipe(new StringOutputParser());

    const result = await chain.invoke({
      input: leadContext,
      contentMaterial: contentMaterial || "Dica: Automação reduz 30% do custo de equipe. Case do cliente X que economizou muito com robôs.",
    });

    return result;
  }
}
