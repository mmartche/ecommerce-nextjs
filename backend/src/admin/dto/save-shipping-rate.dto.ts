import {
    IsBoolean,
    IsInt,
    IsNumber,
    IsOptional,
    IsString,
    Min,
} from 'class-validator';

export class SaveShippingRateDto {
    @IsString()
    provider: string;

    @IsString()
    service: string;

    @IsString()
    zoneName: string;

    @IsInt()
    @Min(0)
    postalCodeFrom: number;

    @IsInt()
    @Min(0)
    postalCodeTo: number;

    @IsInt()
    @Min(0)
    minWeightGrams: number;

    @IsInt()
    @Min(1)
    maxWeightGrams: number;

    @IsNumber()
    @Min(0)
    price: number;

    @IsOptional()
    @IsString()
    estimatedDelivery?: string;

    @IsOptional()
    @IsString()
    deliveryNote?: string;

    @IsBoolean()
    active: boolean;
}