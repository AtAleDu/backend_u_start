import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GetStudentProfileController } from './get-profile/get-profile.controller';
import { GetStudentProfileService } from './get-profile/get-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [GetStudentProfileController],
  providers: [GetStudentProfileService],
})
export class StudentAccountModule {}
