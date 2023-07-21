import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Model, Query, isValidObjectId } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class PokemonService {

  //Inyecion de dependencia

  constructor(
    @InjectModel(Pokemon.name)
     private readonly pokemonModel:Model<Pokemon>
  ){
  }
  async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLocaleLowerCase();


    try {
        const pokemon = await this.pokemonModel.create(createPokemonDto);
        return pokemon;
    } catch (error) {
      //elemento duplicado en la base
      this.handleExceptions(error);  
    }
  }

  findAll(paginationDto: PaginationDto ) {

    //significado como es opcional si el valor viene toma el enviado sino viene toma el definido en la destructuracion
     const {limit = 10, offset=0} = paginationDto;

    return this.pokemonModel.find()
      .limit(limit)
      .skip(offset)
      .sort({no: 1})
      .select('-__v');
  }

  async findOne(term: string) {
    let pokemon:Pokemon;

    if (!isNaN(+term) ){
        pokemon = await this.pokemonModel.findOne({ no:term });
    }

    //MongoID
    if(!pokemon && isValidObjectId(term)){
      pokemon = await this.pokemonModel.findById(term);
    }

    //Name
    if (!pokemon){
      pokemon = await this.pokemonModel.findOne({ name:term.toLocaleLowerCase().trim() });   
    }
    
     if(!pokemon) throw new NotFoundException(`Pokemon with id ${term} not found`);
    return pokemon
  }

 async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    const pokemon = await this.findOne(term);
    
    //si envian el nombre
    if(updatePokemonDto.name)
     { updatePokemonDto.name = updatePokemonDto.name.toLocaleLowerCase();}
     // el new en true es para que devuelva el nuevo objeto actualizado
     //await pokemon.updateOne(updatePokemonDto, { new: true})
      try {
        await pokemon.updateOne(updatePokemonDto);
        //Speard del pokemon que devuelve y lo sobre escribo con el updatePokemon Dto porque ya se cual es la info que se actualizo
        return { ...pokemon.toJSON(), ...updatePokemonDto} ;
      } catch (error) {
          this.handleExceptions(error);     
      }
  }

  async remove(id: string) {
    //  forma 1 
    // const pokemon = await this.findOne(id);
    //     await this.pokemonModel.deleteOne();

    //  Forma 2

    const {deletedCount} = await this.pokemonModel.deleteOne({_id:id});
    if(deletedCount === 0){
      throw new BadRequestException(`Pokemon with id "${id }" not found`);
    }
    return;
  }

  private handleExceptions(error:any){
    if(error.code === 11000){
      throw new BadRequestException(`no id exist in DB`);
    }else{ 
      console.log(error);
      throw new InternalServerErrorException ('Cant updated Pokemon Check Server Logs' );
    }
  }
}
