import { IsNotEmpty, IsNumber, Min, IsBoolean } from 'class-validator';

export class CreateOfferDto {
  @IsNotEmpty()
  @IsNumber()
  itemId: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @IsNotEmpty()
  @IsBoolean()
  hidden: boolean;
}
