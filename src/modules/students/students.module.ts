import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StudentsRatingController } from './students-rating.controller';
import { StudentsRatingService } from './students-rating.service';

@Module({
  imports: [PrismaModule],
  controllers: [StudentsRatingController],
  providers: [StudentsRatingService],
})
export class StudentsModule {}
