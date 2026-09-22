import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(20)
  username: string;

  @IsString()
  @MinLength(2)
  @MaxLength(50)
  realName: string;

  @IsString()
  @MinLength(6)
  password: string;
}
