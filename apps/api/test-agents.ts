import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env from apps/api
config({ path: resolve(__dirname, '.env') });

import { TriageAgent } from './src/agents/triage.agent';
import { SDRAgent } from './src/agents/sdr.agent';
import { CloserAgent } from './src/agents/closer.agent';
import { HelpDeskAgent } from './src/agents/helpdesk.agent';

async function runTests() {
  console.log('🤖 --- INICIANDO TESTE DO ESQUADRÃO LEAD SELLER ---\n');

  try {
    // 1. Teste de Triagem
    console.log('📝 [TESTE 1] AGENTE DE TRIAGEM');
    const triageAgent = new TriageAgent();
    
    const msg1 = "Quero saber quanto custa os planos da LeadSeller para 5 vendedores.";
    const intent1 = await triageAgent.processMessage(msg1);
    console.log(`Mensagem: "${msg1}"`);
    console.log(`Decisão da IA: ${intent1}`); // Esperado: SDR
    console.log('--------------------------------------------------\n');

    const msg2 = "Meu sistema parou de conectar com o WhatsApp, tá dando erro 500.";
    const intent2 = await triageAgent.processMessage(msg2);
    console.log(`Mensagem: "${msg2}"`);
    console.log(`Decisão da IA: ${intent2}`); // Esperado: SUPPORT
    console.log('--------------------------------------------------\n');


    // 2. Teste do SDR
    console.log('📞 [TESTE 2] AGENTE SDR (Qualificação BANT)');
    const sdrAgent = new SDRAgent();
    
    // Simulação do cliente quente pedindo pra agendar
    const sdrResponse = await sdrAgent.processMessage(
      "Gostei muito da ferramenta. Minha empresa fatura 50k/mês e temos urgência em automatizar. Podemos marcar uma call na próxima terça às 14h? Meu email é ceo@empresa.com",
      "Planos: R$ 500/mês. Foco B2B.",
      null, // Passando null para não precisar de tokens do Google reais e testar apenas a Chain, ou podemos testar com mock tools se necessário.
      [
        { role: 'ai', content: 'Olá! Sou o assistente da LeadSeller. Como posso ajudar com suas vendas hoje?' }
      ]
    );
    console.log(`SDR Respondeu: \n${sdrResponse}\n`);
    console.log('--------------------------------------------------\n');

    // 3. Teste do Closer
    console.log('💰 [TESTE 3] AGENTE CLOSER (Matando Objeções)');
    const closerAgent = new CloserAgent();
    const closerResponse = await closerAgent.processMessage(
      "Achei muito bom, mas o valor de 4970 anual está meio puxado agora. Consegue um desconto?",
    );
    console.log(`Closer Respondeu: \n${closerResponse}\n`);
    console.log('--------------------------------------------------\n');

    // 4. Teste do Help Desk
    console.log('🛠️ [TESTE 4] AGENTE HELP DESK (Base RAG)');
    const helpDeskAgent = new HelpDeskAgent();
    const helpDeskResponse = await helpDeskAgent.processMessage(
      "Como eu conecto a agenda do Google no sistema?",
      "MANUAL: Para conectar a agenda do Google, vá no Hub, clique em 'Configurações' no menu lateral e depois no botão azul 'Conectar Google Calendar'. Autorize as permissões de eventos."
    );
    console.log(`Help Desk Respondeu: \n${helpDeskResponse}\n`);
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('Erro durante os testes:', error);
  }
}

runTests();
