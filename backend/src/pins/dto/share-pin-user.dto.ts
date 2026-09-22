import { IsNotEmpty, IsString } from 'class-validator';

export class SharePinUserDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}
