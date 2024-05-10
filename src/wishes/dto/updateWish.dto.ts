import { PartialType } from '@nestjs/mapped-types';
import { CreateWishDto } from './createWish.dto';

export class UpdateWishDto extends PartialType(CreateWishDto) {
  amountToAdd?: number;
}
