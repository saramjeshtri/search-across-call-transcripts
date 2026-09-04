import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Call, CallDocument } from './schemas/call.schema';
import { CreateCallDto } from './dto/create-call.dto';
import { parseTranscript } from './transcript/parser';
import { ChunksService } from '../chunks/chunks.service';
import { SummariesService } from '../summaries/summaries.service';

@Injectable()
export class CallsService {
  private readonly logger = new Logger(CallsService.name);

  constructor(
    @InjectModel(Call.name) private readonly callModel: Model<CallDocument>,
    private readonly chunksService: ChunksService,
    private readonly summariesService: SummariesService,
  ) {}

  // parse the transcript, save it, then summarise + chunk + embed it
  async create(dto: CreateCallDto): Promise<CallDocument> {
    const turns = parseTranscript(dto.transcript);

    const call = await this.callModel.create({
      title: dto.title?.trim() || `Call ${new Date().toISOString()}`,
      turns,
    });

    // a failed summary shouldn't lose the uploaded call
    try {
      call.summary = await this.summariesService.summarize(turns);
      await call.save();
    } catch (err) {
      // leave summary empty; the call is still saved and searchable
      this.logger.warn(`Summary failed for call ${call.id}: ${err}`);
    }

    await this.chunksService.indexCall(call.id, turns);

    return call;
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
