import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePinDto {
  @IsNumber()
  lat: number;

  @IsNumber()
  long: number;

  @IsOptional()
  @IsString()
  note?: string;
}
