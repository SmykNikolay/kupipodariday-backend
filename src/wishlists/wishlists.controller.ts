import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Patch,
} from '@nestjs/common';
import { WishlistsService } from './wishlists.service';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@Controller('wishlists')
export class WishlistsController {
  constructor(private readonly wishlistsService: WishlistsService) {}

  @Get()
  async getWishlists() {
    return await this.wishlistsService.findAllWishlists();
  }

  @Get(':id')
  async getWishList(@Param('id') id: number) {
    return await this.wishlistsService.findWishlistById({ id });
  }

  @Post()
  async createWishList(
    @Body() createWishListDto: CreateWishlistDto,
    @Req() req,
  ) {
    return await this.wishlistsService.createWishlist(
      createWishListDto,
      req.user,
    );
  }

  @Delete(':id')
  async deleteWishList(@Param('id') id: number, @Req() req) {
    return await this.wishlistsService.deleteWishlistById({ id }, req.user);
  }
  @Patch(':id')
  async updateWishList(
    @Param('id') id: number,
    @Body() updateWishListDto: CreateWishlistDto,
    @Req() req,
  ) {
    return await this.wishlistsService.updateWishlistById(
      id,
      updateWishListDto,
      req.user,
    );
  }
}
