import {
  IsInt,
  IsOptional,
  Matches,
  Min,
} from 'class-validator';

export class CalculateShippingDto {
  @Matches(/^\d{4}-\d{3}$/, {
    message:
      'postalCode must use the format 0000-000',
  })
  postalCode: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  weightGrams?: number;
}