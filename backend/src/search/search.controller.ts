import { Body, Controller, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchDto } from './search.dto';
import type { ChunkStrategy } from '../calls/chunking/chunk.type';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // POST /search  { query }   optional ?strategy=speaker|time|size
  @Post()
  search(@Body() dto: SearchDto, @Query('strategy') strategy?: ChunkStrategy) {
    return this.searchService.search(dto.query, strategy);
  }
}
