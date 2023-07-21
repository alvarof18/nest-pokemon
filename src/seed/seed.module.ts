import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';

import { PokemosnModule } from 'src/pokemosn/pokemon.module';
import { CommonModule } from 'src/common/common.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  exports:[SeedService],
  imports:[PokemosnModule, CommonModule]
  
})
export class SeedModule {}
