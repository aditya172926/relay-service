import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @EventPattern('relay_to_solana')
  async processNewMessage(message: string) {
    console.log("The message received from RELAY SERVICE is ", message);
    await this.appService.relayDataToSolana(message);
  }
}
