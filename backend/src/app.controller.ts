import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @InjectConnection() private readonly mongo: Connection,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // is the API up and connected to the database?
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      db: this.mongo.readyState === 1 ? 'connected' : 'disconnected',
    };
  }
}
