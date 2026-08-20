import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';

import { Type } from 'class-transformer';

class OrderColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  hex?: string;
}

class OrderFontDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  bordered: boolean;
}

class OrderItemDto {
  @IsInt()
  @IsPositive()
  productId: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @Min(1)
  keys: number;

  @ValidateNested()
  @Type(() => OrderColorDto)
  color: OrderColorDto;

  @ValidateNested()
  @Type(() => OrderFontDto)
  font: OrderFontDto;
}

class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @Matches(/^\d{4}-\d{3}$/, {
    message:
      'postalCode must use the format 0000-000',
  })
  postalCode: string;

  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;
}