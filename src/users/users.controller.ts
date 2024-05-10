import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard/jwt.guard';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UsersService } from './users.service';
import { FindUserDto } from './dto/findUser.dto';

@UseGuards(JwtGuard)
@Controller('users')
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getActiveUser(@Req() req) {
    return await this.usersService.findOne(req.user.id);
  }

  @Patch('me')
  async updateUser(@Req() req, @Body() updateUserdto: UpdateUserDto) {
    return await this.usersService.update(req.user.id, updateUserdto);
  }

  @Get('me/wishes')
  async getActiveUserWishes(@Req() req) {
    return await (
      await this.usersService.findOne(req.user.id)
    ).wishes;
  }

  @Get(':username')
  async getByUsername(@Param('username') username: string) {
    return await this.usersService.findUserByName(username);
  }

  @Get(':username/wishes')
  async getUserWishes(@Param('username') username: string) {
    return await this.usersService.findUserByName(username);
  }
  @Post('find')
  findUsers(@Body('query') query: FindUserDto) {
    return this.usersService.findMany(query);
  }
}
