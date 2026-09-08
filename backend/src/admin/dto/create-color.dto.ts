import {
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class CreateColorDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'hex must be a valid color such as #FFFFFF',
  })
  hex: string;

  @IsOptional()
  @IsString()
  filamentCode?: string;
}