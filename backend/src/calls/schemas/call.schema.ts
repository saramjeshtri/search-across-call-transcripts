import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// a turn stored inside a call, no separate id needed for each one
@Schema({ _id: false })
export class TurnSchemaClass {
  @Prop({ required: true })
  speaker: string;

  @Prop({ required: true })
  timeSeconds: number;

  @Prop({ required: true })
  text: string;
}

@Schema({ timestamps: true })
export class Call {
  @Prop({ required: true })
  title: string;

  // turns live inside the call since we always load them together
  @Prop({ type: [TurnSchemaClass], default: [] })
  turns: TurnSchemaClass[];

  // short summary + agreed next steps, generated on upload
  @Prop({ default: '' })
  summary: string;
}

export type CallDocument = HydratedDocument<Call>;
export const CallSchema = SchemaFactory.createForClass(Call);
