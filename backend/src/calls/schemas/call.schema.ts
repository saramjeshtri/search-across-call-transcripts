import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// A turn stored inside a Call. No separate _id needed for each one.
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

  // Turns are stored inside the call because we always load them together.
  @Prop({ type: [TurnSchemaClass], default: [] })
  turns: TurnSchemaClass[];
}

export type CallDocument = HydratedDocument<Call>;
export const CallSchema = SchemaFactory.createForClass(Call);
