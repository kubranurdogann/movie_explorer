import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MoviesController } from './films.controller';
import { MoviesService } from './films.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Film, FilmSchema } from './films.schema';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule,  MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),], // 🔹 HttpModule eklendi
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class FilmsModule {}
