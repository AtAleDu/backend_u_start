import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { GetCompanyProfileController } from './get-profile/get-profile.controller';
import { GetCompanyProfileService } from './get-profile/get-profile.service';

@Module({
  imports: [PrismaModule],
  controllers: [GetCompanyProfileController],
  providers: [GetCompanyProfileService],
})
export class CompanyAccountModule {}
