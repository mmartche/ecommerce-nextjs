import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
  ArrayMinSize,
  Matches,
} from 'class-validator';

import { Type } from 'class-transformer';

export class ProductImageDto {
  @IsString()
  @Matches(
    /^(https?:\/\/.+|\/uploads\/products\/.+)$/,
    {
      message:
        'url must be an external URL or a product upload path',
    },
  )
  url: string;

  @IsOptional()
  @IsString()
  alt?: string;
}

export class SaveProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @MinLength(2)
  slug: string;

  @IsString()
  @MinLength(2)
  description: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  basePrice: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  minKeys: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxKeys: number;

  @IsBoolean()
  active: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({
    each: true,
  })
  colorIds: number[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsInt({
    each: true,
  })
  fontIds: number[];

  @IsArray()
  @ValidateNested({
    each: true,
  })
  @Type(() => ProductImageDto)
  images: ProductImageDto[];
}