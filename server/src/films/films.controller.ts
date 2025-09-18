import { Controller, Get, Query } from '@nestjs/common';
import { MoviesService } from './films.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get('popular')
  async getPopularMovies() {
    return this.moviesService.getPopularMovies();
  }

 

  @Get('grouped-by-genre')
  async getGroupedMovies() {
    return this.moviesService.getGroupedMovies();
  }

  @Get('semantic-search')
  async semanticSearch(@Query('q') query: string) {
    return this.moviesService.semanticSearch(query);
  }

  @Get('fetch-and-store')
async fetchAndStoreMovies(@Query('page') page: number = 1) {
  console.log(`🎬 Fetch & Store Movies Başladı | Page: ${page}`);
  try {
    return await this.moviesService.fetchAndStoreMovies(page);
  } catch (error: any) {
    console.error('❌ fetchAndStoreMovies HATASI =>', error.response?.data || error.message);
    throw error; // Nest 500 döndürür, ama en azından log doğru olur
  }
}

}
