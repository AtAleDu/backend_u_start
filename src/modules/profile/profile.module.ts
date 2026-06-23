import { Module } from '@nestjs/common';
import { CompanyAccountModule } from './company-account/company-account.module';
import { StudentAccountModule } from './student-account/student-account.module';

@Module({
  imports: [StudentAccountModule, CompanyAccountModule],
})
export class ProfileModule {}
