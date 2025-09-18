import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FilmDocument = Film & Document;

@Schema()
export class Film {
  @Prop()
  id: number;

  @Prop()
  title: string;

  @Prop()
  overview: string;

  @Prop()
  poster_path: string;

  @Prop()
  release_date: string;

  @Prop()
  vote_average: number;

  // ✅ Embedding alanı ekleniyor
  @Prop({ type: [Number], required: true })
  embedding: number[];

}

export const FilmSchema = SchemaFactory.createForClass(Film);
