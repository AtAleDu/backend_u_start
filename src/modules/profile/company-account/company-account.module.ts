import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GetCompanyProfileController } from './get-profile/get-profile.controller';
import { GetCompanyProfileService } from './get-profile/get-profile.service';
import { UpdateCompanyProfileController } from './update-profile/update-profile.controller';
import { UpdateCompanyProfileService } from './update-profile/update-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [GetCompanyProfileController, UpdateCompanyProfileController],
  providers: [GetCompanyProfileService, UpdateCompanyProfileService],
})
export class CompanyAccountModule {}
