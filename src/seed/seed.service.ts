import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemosn/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapter/axios.adapter';

@Injectable()
export class SeedService { 

  constructor(
    @InjectModel(Pokemon.name)
     private readonly pokemonModel:Model<Pokemon>,
     private readonly http:AxiosAdapter
  ){
  }

  async executeSeed(){

    //limpiar la base de datos antes de insetar
    await this.pokemonModel.deleteMany({});

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');
    const insertPromiseArray = [];

    data.results.forEach(({name, url}) =>{
      const segments = url.split('/');
      const no  = +segments[segments.length - 2];
      insertPromiseArray.push(this.pokemonModel.create({ name, no }));
    });
    //otra opcion es utilizar 
      // this.pokemonModel.insertMany(pokemones)
    await Promise.all(insertPromiseArray);
    return 'Seed Executed';
  }
}
