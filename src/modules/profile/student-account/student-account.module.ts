import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GetStudentProfileController } from './get-profile/get-profile.controller';
import { GetStudentProfileService } from './get-profile/get-profile.service';
import { UpdateStudentProfileController } from './update-profile/update-profile.controller';
import { UpdateStudentProfileService } from './update-profile/update-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [GetStudentProfileController, UpdateStudentProfileController],
  providers: [GetStudentProfileService, UpdateStudentProfileService],
})
export class StudentAccountModule {}
