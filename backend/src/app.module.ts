import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

import { ShippingModule } from './shipping/shipping.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';

import { PaymentsModule } from './payments/payments.module';
import { PostalCodesModule } from './postal-codes/postal-codes.module';

import {
  ThrottlerGuard,
  ThrottlerModule,
} from '@nestjs/throttler';

import {
  APP_GUARD,
} from '@nestjs/core';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    ProductsModule,
    ShippingModule,
    OrdersModule,
    AdminModule,
    PaymentsModule,
    PostalCodesModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 100,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }