import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  orderId: number;

  @IsIn([
    'MBWAY',
    'CARD',
  ])
  method: string;

  @ValidateIf(
    (dto) =>
      dto.method === 'MBWAY',
  )
  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(\+351|351)?9\d{8}$/,
    {
      message:
        'Invalid Portuguese mobile number',
    },
  )
  mobileNumber?: string;
}