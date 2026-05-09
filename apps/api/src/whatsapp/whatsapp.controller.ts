import { Controller, Post, Get, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('whatsapp')
export class WhatsappController {
  
  // Rota de verificação do Webhook da Meta (GET)
  @Get('webhook')
  verifyWebhook(@Req() req: Request, @Res() res: Response) {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'leadseller_token';

    if (mode && token) {
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(HttpStatus.OK).send(challenge);
      } else {
        return res.sendStatus(HttpStatus.FORBIDDEN);
      }
    }
    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }

  // Rota de recebimento de mensagens da Meta/UAZ (POST)
  @Post('webhook')
  async receiveMessage(@Body() body: any, @Res() res: Response) {
    console.log('Webhook event received:', JSON.stringify(body, null, 2));

    // Aqui vamos integrar o LangChain e Supabase.
    // O motor vai ler: body.entry[0].changes[0].value.messages[0]

    return res.status(HttpStatus.OK).send('EVENT_RECEIVED');
  }
}
