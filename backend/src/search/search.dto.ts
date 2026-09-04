import { IsString, MinLength } from 'class-validator';

// Body for POST /search
export class SearchDto {
  @IsString()
  @MinLength(1)
  query: string;
}
