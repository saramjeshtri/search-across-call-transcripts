import { IsString, MinLength } from 'class-validator';

// body for POST /search
export class SearchDto {
  @IsString()
  @MinLength(1)
  query: string;
}
