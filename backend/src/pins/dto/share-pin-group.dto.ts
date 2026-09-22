import { IsNotEmpty, IsString } from 'class-validator';

export class SharePinGroupDto {
  @IsString()
  @IsNotEmpty()
  groupId: string;
}
