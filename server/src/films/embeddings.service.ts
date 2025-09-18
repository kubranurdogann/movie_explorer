import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film } from './films.schema';

@Injectable()
export class EmbeddingsService {
  private openai: OpenAI;

  constructor(@InjectModel(Film.name) private filmModel: Model<Film>) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async generateEmbeddingsForAllFilms() {
    const films = await this.filmModel.find();

    for (const film of films) {
      if (film.embedding && film.embedding.length > 0) continue; // Zaten varsa geç

      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: `${film.title} ${film.overview}`,
      });

      film.embedding = response.data[0].embedding;
      await film.save();
    }

    return { message: 'Tüm filmler için embedding oluşturuldu!' };
  }
}
