import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishDto } from './dto/createWish.dto';
import { In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Wish } from './entities/wish.entity';
import { UpdateWishDto } from './dto/updateWish.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishesService {
  constructor(
    @InjectRepository(Wish) private wishRepo: Repository<Wish>,
    private usersService: UsersService,
  ) {}

  async createWish(createWishDto: CreateWishDto, username: string) {
    try {
      const user = await this.usersService.findUserByName(username);
      if (!user) {
        throw new Error('Пользователь в неведении');
      }
      const wish = this.wishRepo.create({ ...createWishDto, owner: user });
      return this.wishRepo.save(wish);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Сервер в замешательстве');
    }
  }

  async wishLast() {
    return this.wishRepo.find({ order: { createdAt: 'DESC' }, take: 40 });
  }

  async wishesTop() {
    return this.wishRepo.find({ order: { copied: 'DESC' }, take: 10 });
  }

  async findById(id: number, relations: string[] = []) {
    const wish = await this.wishRepo.findOne({ where: { id }, relations });
    if (!wish) {
      throw new NotFoundException('Подарок ушел в никуда');
    }
    return wish;
  }

  async deleteById(id: number, currentUser) {
    const wish = await this.findById(id);

    if (wish.owner !== currentUser.id) {
      throw new ForbiddenException(
        'Удаление чужого подарка - непозволительная дерзость',
      );
    }
    return this.wishRepo.delete({ id });
  }

  async findManyById(ids: number[]) {
    return this.wishRepo.findBy({ id: In(ids) });
  }

  async copyWish(id: number, currentUser: User) {
    const wish = await this.findById(id, ['owner']);

    if (wish.owner.id === currentUser.id) {
      throw new ConflictException('Этот подарок уже в вашем списке');
    }

    const newWish = { ...wish, copied: wish.copied + 1 };
    await this.createWish(newWish, currentUser.username);
    return this.wishRepo.save(newWish);
  }

  async updateById(userId: number, id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.findById(id, ['owner']);
    if (userId !== wish.owner.id) {
      throw new ForbiddenException('Изменение чужого подарка - недопустимо');
    }
    if (wish.raised !== 0) {
      throw new ConflictException(
        'Изменение стоимости подарка с поддержкой - невозможно',
      );
    }
    return await this.wishRepo.update(id, updateWishDto);
  }
  async updateRaisedId(id: number, updateWishDto: UpdateWishDto) {
    const wish = await this.wishRepo.findOne({ where: { id } });
    if (!wish) {
      throw new NotFoundException(`Подарок с ID ${id} ушел в туман`);
    }

    const { raised, price } = wish;
    const { amountToAdd } = updateWishDto;

    if (!amountToAdd || amountToAdd <= 0) {
      throw new BadRequestException(
        'Сумма для добавления должна быть больше нуля',
      );
    }

    if (raised >= price) {
      throw new ConflictException('Подарок уже полностью оплачен');
    }

    if (amountToAdd + raised > price) {
      throw new ForbiddenException(
        `Сумма взноса превышает оставшуюся стоимость подарка: ${price - raised} рублей.`,
      );
    }

    return await this.wishRepo.update(id, {
      ...updateWishDto,
      raised: raised + amountToAdd,
    });
  }
}
