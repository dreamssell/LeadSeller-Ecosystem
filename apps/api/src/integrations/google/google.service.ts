import { Injectable } from '@nestjs/common';
import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface TenantGoogleTokens {
  access_token: string;
  refresh_token: string;
}

@Injectable()
export class GoogleService {
  
  /**
   * Retorna um cliente OAuth2 configurado para um cliente (tenant) específico
   * @param tokens Os tokens do usuário buscados no Supabase
   */
  getOAuthClient(tokens: TenantGoogleTokens): OAuth2Client {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    // Set credentials dinamicamente para o tenant
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    return oauth2Client;
  }

  /**
   * Retorna a instância da API do Calendar pronta para uso pelo tenant
   */
  getCalendarApi(tokens: TenantGoogleTokens): calendar_v3.Calendar {
    const auth = this.getOAuthClient(tokens);
    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Método utilitário para gerar a URL de autorização que o cliente vai clicar no HUB (CRM)
   */
  getAuthUrl(): string {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      prompt: 'consent' // Garante que o refresh_token será retornado
    });
  }
}
