import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';

import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

import { ShippingModule } from './shipping/shipping.module';
import { OrdersModule } from './orders/orders.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    PrismaModule,

    UsersModule,
    AuthModule,

    ProductsModule,

    ShippingModule,
    OrdersModule,
    AdminModule,
  ],
})
export class AppModule {}