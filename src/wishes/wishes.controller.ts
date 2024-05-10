import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  Patch,
} from '@nestjs/common';
import { WishesService } from './wishes.service';
import { CreateWishDto } from './dto/createWish.dto';
import { UpdateWishDto } from './dto/updateWish.dto';
import { JwtGuard } from 'src/auth/guard/jwt.guard';

@UseGuards(JwtGuard)
@UseInterceptors(ClassSerializerInterceptor)
@Controller('wishes')
export class WishesController {
  constructor(private readonly wishesService: WishesService) {}

  @Post()
  async createWish(@Body() createWishDto: CreateWishDto, @Req() req) {
    return await this.wishesService.createWish(
      createWishDto,
      req.user.username,
    );
  }

  @Get('/last')
  async getLastWishes() {
    return await this.wishesService.wishLast();
  }

  @Get('/top')
  async getTopWishes() {
    return await this.wishesService.wishesTop();
  }

  @Get(':id')
  async getWish(@Param('id') id: number) {
    return await this.wishesService.findById(id, ['owner']);
  }

  @Patch(':id')
  async updateById(
    @Req() req,
    @Param('id') id: number,
    @Body() updateWishDto: UpdateWishDto,
  ) {
    return await this.wishesService.updateById(req.user.id, id, updateWishDto);
  }
  @Delete(':id')
  async deleteWish(@Param('id') id: number, @Req() req) {
    return await this.wishesService.deleteById(id, req.user);
  }

  @Post(':id/copy')
  async copyWish(@Param('id') id: number, @Req() req) {
    return await this.wishesService.copyWish(id, req.user);
  }
}
