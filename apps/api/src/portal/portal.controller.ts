import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { PortalService } from './portal.service';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  @Post('generate-access')
  async generateAccess(@Body() body: { leadId: string }) {
    if (!body.leadId) {
      throw new HttpException('leadId is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const result = await this.portalService.generateAccessForLead(body.leadId);
      return result;
    } catch (error) {
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('create-checkout')
  async createCheckoutSession(@Body() body: { invoiceId: string }) {
    if (!body.invoiceId) {
      throw new HttpException('invoiceId is required', HttpStatus.BAD_REQUEST);
    }
    
    try {
      const result = await this.portalService.createStripeCheckout(body.invoiceId);
      return result;
    } catch (error) {
      throw new HttpException(error.message || 'Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
