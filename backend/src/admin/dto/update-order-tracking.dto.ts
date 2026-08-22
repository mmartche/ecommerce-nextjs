import {
  IsOptional,
  IsString,
  IsUrl,
} from "class-validator";

export class UpdateOrderTrackingDto {
  @IsString()
  trackingCode: string;

  @IsOptional()
  @IsUrl()
  trackingUrl?: string;
}