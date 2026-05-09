import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WhatsappModule } from './whatsapp/whatsapp.module';
import { AgentsModule } from './agents/agents.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { PortalModule } from './portal/portal.module';

@Module({
  imports: [WhatsappModule, AgentsModule, IntegrationsModule, PortalModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
