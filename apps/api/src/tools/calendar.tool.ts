import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { GoogleService, TenantGoogleTokens } from "../integrations/google/google.service";

/**
 * Cria a ferramenta de agendamento acoplada dinamicamente aos tokens do cliente (Tenant)
 */
export const createGoogleCalendarTool = (tenantTokens: TenantGoogleTokens) => {
  const googleService = new GoogleService();

  return new DynamicStructuredTool({
    name: "schedule_google_meet",
    description: "Use esta ferramenta para criar uma reunião no Google Meet no calendário do vendedor. Passe a data e hora desejada.",
    schema: z.object({
      summary: z.string().describe("Título da reunião, ex: 'Call de Qualificação - Lead X'"),
      startTime: z.string().describe("Data e hora de início no formato ISO (ex: '2026-05-15T14:00:00-03:00')"),
      durationMinutes: z.number().describe("Duração da reunião em minutos (ex: 30)"),
      attendeeEmail: z.string().email().optional().describe("E-mail do lead para convite, se tivermos"),
    }),
    func: async ({ summary, startTime, durationMinutes, attendeeEmail }) => {
      try {
        const calendar = googleService.getCalendarApi(tenantTokens);
        
        const start = new Date(startTime);
        const end = new Date(start.getTime() + durationMinutes * 60000);

        const event = {
          summary: summary,
          description: "Reunião agendada automaticamente pelo Assistente IA da LeadSeller.",
          start: {
            dateTime: start.toISOString(),
          },
          end: {
            dateTime: end.toISOString(),
          },
          attendees: attendeeEmail ? [{ email: attendeeEmail }] : [],
          conferenceData: {
            createRequest: {
              requestId: `meet-${Date.now()}`,
              conferenceSolutionKey: { type: "hangoutsMeet" },
            },
          },
        };

        // No ambiente real, precisamos das chaves do Google (.env) para funcionar sem erro de Auth
        if (!process.env.GOOGLE_CLIENT_ID) {
          return "SUCESSO_SIMULADO: A reunião foi agendada (Modo simulação pois as credenciais do Google não estão no .env ainda). Link gerado: https://meet.google.com/abc-defg-hij";
        }

        const response = await calendar.events.insert({
          calendarId: 'primary',
          requestBody: event,
          conferenceDataVersion: 1,
        });

        return `Reunião agendada com sucesso! O link do Meet é: ${response.data.hangoutLink}`;
      } catch (error) {
        console.error("Erro ao agendar reunião:", error);
        return "Infelizmente ocorreu um erro ao agendar a reunião no calendário. Tente um horário diferente ou verifique a integração.";
      }
    },
  });
};
