import { IsOptional, IsString } from 'class-validator';

export class UpdatePinDto {
  @IsOptional()
  @IsString()
  note?: string;
}
