import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import type { ChunkStrategy } from '../../calls/chunking/chunk.type';

@Schema()
export class Chunk {
  @Prop({ type: Types.ObjectId, ref: 'Call', required: true, index: true })
  callId: Types.ObjectId;

  @Prop({ type: String, required: true })
  strategy: ChunkStrategy;

  @Prop({ required: true })
  timeSeconds: number;

  // the 768 numbers from Gemini
  @Prop({ type: [Number], required: true })
  embedding: number[];
}

export type ChunkDocument = HydratedDocument<Chunk>;
export const ChunkSchema = SchemaFactory.createForClass(Chunk);
