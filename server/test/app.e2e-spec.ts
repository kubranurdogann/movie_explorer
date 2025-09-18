import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
@common.Injectable()
export class MoviesService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.themoviedb.org/3';

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: common.HttpServer
  ) {
    this.apiKey = this.configService.get<string>('API_KEY');
  }

  async getPopularMovies() {
    const response = await this.httpService.axiosRef.get(
      `https://api.themoviedb.org/3/movie/popular?api_key=${this.apiKey}&language=en-US&page=1`
    );
    const data = await response.json();
    return data.results;
  }

  async getGroupedMovies() {

    const genresUrl = `${this.baseUrl}/genre/movie/list?api_key=${this.apiKey}&language=tr-TR`;
    const genresResponse = await this.httpService.axiosRef.get(genresUrl);
    const genres = genresResponse.data.genres;

    const groupedMovies = await Promise.all(
      genres.map(async (genre) => {
        const url = `${this.baseUrl}/discover/movie?api_key=${this.apiKey}&with_genres=${genre.id}&language=tr-TR`;
        const response = await this.httpService.axiosRef.get(url);

        return {
          genre: genre.name,
          movies: response.data.results,
        };
      })
    );

    return groupedMovies;
  }

  async searchMovies(query: string) {
    const apiKey = this.configService.get<string>('API_KEY');
    const url = `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=tr-TR&query=${query}`;
    const res = await axios.get(url);
    return res.data.results;
  }
}
