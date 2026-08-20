import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadsController } from './uploads.controller';

@Module({
  imports: [
    AuthModule,
  ],

  controllers: [
    AdminController,
    UploadsController,
  ],

  providers: [
    AdminService,
  ],
})
export class AdminModule { }