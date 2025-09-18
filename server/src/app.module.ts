import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsModule } from './films/films.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Config global olsun
    }),
    MongooseModule.forRootAsync({
  useFactory: async () => {
    console.log('MongoDB URI:', process.env.MONGO_URI);
    return {
      uri: process.env.MONGO_URI,
    };}}), // <-- Burada bağlantı sağlanıyor
    FilmsModule,
  ],
})
export class AppModule {}
