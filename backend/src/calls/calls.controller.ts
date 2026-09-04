import { Body, Controller, Get, Post } from '@nestjs/common';
import { CallsService } from './calls.service';
import { CreateCallDto } from './dto/create-call.dto';

// routes are prefixed with /calls
@Controller('calls')
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post()
  create(@Body() dto: CreateCallDto) {
    return this.callsService.create(dto);
  }

  @Get()
  findAll() {
    return this.callsService.findAll();
  }
}
