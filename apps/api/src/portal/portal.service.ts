import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

@Injectable()
export class PortalService {
  private supabaseAdmin;
  private stripe;

  constructor() {
    // Inicializa Supabase com a Service Role Key (Admin) para criar usuários burlando o RLS
    this.supabaseAdmin = createClient(
      process.env.SUPABASE_URL || 'https://db.ofolnoemiidtekinjyoh.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Inicializa o Stripe
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'mk_1STKdRCn0SbQfz1VHU8e7qkK', {
      apiVersion: '2025-01-27.acacia', // Usando uma API Version padrão/recente
    });
  }

  async generateAccessForLead(leadId: string) {
    // 1. Busca os dados do Lead
    const { data: lead, error: leadError } = await this.supabaseAdmin
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single();

    if (leadError || !lead) {
      throw new Error(`Lead not found: ${leadError?.message}`);
    }

    if (lead.auth_user_id) {
      throw new Error('This lead already has portal access.');
    }

    if (!lead.email) {
      throw new Error('This lead does not have an email address.');
    }

    // 2. Cria senha forte e provisória
    const tempPassword = `LDS-${Math.random().toString(36).slice(-6)}!`;

    // 3. Cria usuário no Supabase Auth usando o painel Admin
    const { data: authData, error: authError } = await this.supabaseAdmin.auth.admin.createUser({
      email: lead.email,
      password: tempPassword,
      email_confirm: true, // Auto-confirmamos o email
      user_metadata: { lead_id: lead.id, is_customer: true },
    });

    if (authError) {
      throw new Error(`Error creating auth user: ${authError.message}`);
    }

    // 4. Salva o ID no Lead
    const { error: updateError } = await this.supabaseAdmin
      .from('leads')
      .update({ auth_user_id: authData.user.id })
      .eq('id', lead.id);

    if (updateError) {
      throw new Error(`Error linking auth to lead: ${updateError.message}`);
    }

    return { success: true, email: lead.email, tempPassword };
  }

  async createStripeCheckout(invoiceId: string) {
    // 1. Pega a Invoice
    const { data: invoice, error: invError } = await this.supabaseAdmin
      .from('invoices')
      .select('*, lead:leads(*)')
      .eq('id', invoiceId)
      .single();

    if (invError || !invoice) throw new Error('Invoice not found');
    if (invoice.status === 'PAID') throw new Error('Invoice is already paid');

    // 2. Cria o Checkout no Stripe
    const session = await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto'],
      customer_email: invoice.lead.email || undefined,
      line_items: [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: `Fatura LeadSeller - #${invoice.id.split('-')[0]}`,
              description: 'Referente aos serviços contratados.',
            },
            unit_amount: Math.round(invoice.amount * 100), // Stripe usa centavos
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `http://localhost:5175/dashboard?success=true&invoice=${invoice.id}`,
      cancel_url: `http://localhost:5175/dashboard?canceled=true`,
      metadata: {
        invoice_id: invoice.id,
        lead_id: invoice.lead_id,
        tenant_id: invoice.tenant_id,
      },
    });

    return { url: session.url };
  }
}
