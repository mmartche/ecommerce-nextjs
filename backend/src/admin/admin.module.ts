import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

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
    UploadsService
  ],
})
export class AdminModule { }