import { IsNotEmpty, IsString, IsUrl, Length } from 'class-validator';

export class CreateWishlistDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 250)
  name: string;

  @IsUrl()
  image: string;

  @IsNotEmpty()
  itemsId: number[];
}
