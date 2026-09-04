import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller()
export class AppController {
  constructor(@InjectConnection() private readonly mongo: Connection) {}

  // is the API up and connected to the database?
  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      db: this.mongo.readyState === 1 ? 'connected' : 'disconnected',
    };
  }
}
