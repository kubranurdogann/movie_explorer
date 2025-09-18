import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { InjectModel } from '@nestjs/mongoose';
import { Film } from './films.schema';
import OpenAI from 'openai';

@Injectable()
export class MoviesService {
  private readonly API_URL = 'https://api.themoviedb.org/3';
  private openai: OpenAI;
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    @InjectModel(Film.name) private filmModel: Model<Film>,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  // MoviesService sınıfı içinde ekle / değiştir

  // Güvenli cosine similarity
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (
    !Array.isArray(vecA) ||
    !Array.isArray(vecB) ||
    vecA.length === 0 ||
    vecB.length === 0
  )
    return 0;

  // aynı uzunlukta olduklarından emin ol (kısa olan uzunluğa göre hesapla)
  const len = Math.min(vecA.length, vecB.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (let i = 0; i < len; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }

  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

async getEmbedding(text: string): Promise<number[]> {
  try {
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: text,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('❌ OpenAI Embedding alınamadı:', error.message);
    return [];
  }
}

  async semanticSearch(query: string) {
    const queryEmbedding = await this.getEmbedding(query);

    if (queryEmbedding.length === 0) {
      throw new Error('❌ Query embedding alınamadı');
    }

    const movies = await this.filmModel.find().lean();

    const results = movies.map((movie: any) => {
      const score = this.cosineSimilarity(queryEmbedding, movie.embedding);
      return {
        id: movie.id,
        title: movie.title,
        overview: movie.overview,
        poster_path: movie.poster_path,
        score,
      };
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, 10);
  }

  async getPopularMovies() {
  const apiKey = this.configService.get<string>('TMDB_API_KEY');
  const url = `${this.API_URL}/movie/popular?api_key=${apiKey}&language=tr-TR`;
  const { data } = await firstValueFrom(this.httpService.get(url));
  return data.results;
}

async searchMovies(query: string) {
  const embedding = await this.getEmbedding(query);

  if (embedding.length === 0) {
    throw new Error('❌ Embedding alınamadı');
  }

  const movies = await this.filmModel
    .find({
      title: {
        $not: new RegExp(
          '[\\p{Script=Han}\\p{Script=Hiragana}\\p{Script=Katakana}\\p{Script=Hangul}]',
          'u',
        ),
      },
    })
    .lean();

  // Benzerlik skoru
  const results = movies.map((movie: any) => {
    const score = this.cosineSimilarity(embedding, movie.embedding);
    return {
      title: movie.title,
      overview: movie.overview,
      score,
    };
  });

  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 10);
}


  async getGroupedMovies() {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    const url = `${this.API_URL}/movie/popular?api_key=${apiKey}&language=tr-TR&page=1`;

    const { data } = await firstValueFrom(this.httpService.get(url));

    const genresUrl = `${this.API_URL}/genre/movie/list?api_key=${apiKey}&language=tr-TR`;
    const { data: genreData } = await firstValueFrom(
      this.httpService.get(genresUrl),
    );

    const genres = genreData.genres;

    const grouped = genres.map((genre) => ({
      genre: genre.name,
      movies: data.results.filter((movie) =>
        movie.genre_ids.includes(genre.id),
      ),
    }));

    return grouped;
  }

  async fetchAndStoreMovies(page: number = 1) {
    const apiKey = this.configService.get<string>('TMDB_API_KEY');
    const url = `${this.API_URL}/movie/popular?api_key=${apiKey}&language=tr-TR&page=${page}`;

    const { data } = await firstValueFrom(this.httpService.get(url));

    let savedCount = 0;

    for (const movie of data.results) {
      const exists = await this.filmModel.findOne({ id: movie.id }).exec();
      if (exists) {
        this.logger.log(`⚠️ Film zaten var: ${movie.title}`);
        continue;
      }

      try {
        const embeddingResponse = await this.openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: `${movie.title} ${movie.overview}`,
        });

        const embedding = embeddingResponse.data[0].embedding;

        await this.filmModel.create({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          poster_path: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          embedding,
        });

        this.logger.log(`✅ Kaydedildi: ${movie.title}`);
        savedCount++;
      } catch (error) {
  console.error('❌ fetchAndStoreMovies HATASI =>', error);
}




    }

    return {
      message: `Sayfa ${page} filmleri başarıyla kaydedildi!`,
      totalSaved: savedCount,
    };
  }
}
