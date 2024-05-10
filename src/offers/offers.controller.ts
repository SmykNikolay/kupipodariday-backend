import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/createOffer.dto';

@UseGuards(JwtGuard)
@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}
  @Post()
  async createOffer(
    @Body() createOfferDto: CreateOfferDto,
    @Req() currentUser: any,
  ) {
    return await this.offersService.createOffer(currentUser.user, {
      ...createOfferDto,
      hidden: false,
    });
  }

  @Get()
  async getAllOffers() {
    return await this.offersService.findAllOffers();
  }

  @Get(':id')
  async getOffer(@Param('id') id: number) {
    return await this.offersService.findOfferById(id);
  }
}
