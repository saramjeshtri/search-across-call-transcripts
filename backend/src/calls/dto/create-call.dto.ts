import { IsOptional, IsString, MinLength } from 'class-validator';

// Body for POST /calls. The global ValidationPipe checks these rules
// and returns 400 if they fail.
export class CreateCallDto {
  @IsString()
  @MinLength(1)
  transcript: string;

  @IsOptional()
  @IsString()
  title?: string;
}
