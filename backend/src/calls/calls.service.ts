import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Call, CallDocument } from './schemas/call.schema';
import { CreateCallDto } from './dto/create-call.dto';
import { parseTranscript } from './transcript/parser';

@Injectable()
export class CallsService {
  constructor(
    @InjectModel(Call.name) private readonly callModel: Model<CallDocument>,
  ) {}

  // parse the transcript and save it
  async create(dto: CreateCallDto): Promise<CallDocument> {
    const turns = parseTranscript(dto.transcript);

    return this.callModel.create({
      title: dto.title?.trim() || `Call ${new Date().toISOString()}`,
      turns,
    });
  }

  // list without the turns to keep the response small
  async findAll(): Promise<Call[]> {
    return this.callModel
      .find()
      .select('-turns')
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }

  async findOne(id: string): Promise<Call> {
    const call = await this.callModel.findById(id).lean().exec();
    if (!call) throw new NotFoundException(`Call ${id} not found`);
    return call;
  }
}
