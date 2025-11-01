import { IsNotEmpty, IsString, Length } from 'class-validator';

export class JoinRoomDto {
  @IsString()
  @IsNotEmpty({ message: 'User ID is required' })
  @Length(1, 128, { message: 'User ID must be between 1 and 128 characters' })
  userId: string;
}
