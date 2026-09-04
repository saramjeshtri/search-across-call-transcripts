import { IsOptional, IsString, MinLength } from 'class-validator';

// body for POST /calls
export class CreateCallDto {
  @IsString()
  @MinLength(1)
  transcript: string;

  @IsOptional()
  @IsString()
  title?: string;
}
