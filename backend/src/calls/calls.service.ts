import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
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

    // nothing parsed - reject instead of saving an empty, useless call
    if (turns.length === 0) {
      throw new BadRequestException(
        'No turns found. Check the transcript format: [mm:ss] Speaker: text',
      );
    }

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

    // without chunks the call can't be searched at all, so don't keep a
    // half-saved one - undo it and let the caller know the upload failed
    try {
      await this.chunksService.indexCall(call.id, turns);
    } catch (err) {
      this.logger.error(`Indexing failed for call ${call.id}: ${err}`);
      await this.callModel.findByIdAndDelete(call.id).catch(() => null);
      throw err;
    }

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
