import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateWishlistDto } from './dto/createWishlist.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { Wishlist } from './entities/wishlist.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class WishlistsService {
  constructor(
    private readonly wishesService: WishesService,
    private readonly usersService: UsersService,
    @InjectRepository(Wishlist) private wishlistsRepo: Repository<Wishlist>,
  ) {}

  async findAllWishlists() {
    return await this.wishlistsRepo.find({
      relations: ['owner', 'items'],
    });
  }
  async findWishlistById(query: { id: number }): Promise<Wishlist> {
    const wishlist: Wishlist = await this.wishlistsRepo.findOne({
      where: query,
      relations: ['owner', 'items'],
    });
    if (!wishlist) {
      throw new NotFoundException(`Список желаний с ID ${query.id} не найден.`);
    }
    return wishlist;
  }

  async createWishlist(
    createWishListDto: CreateWishlistDto,
    currentUser: User,
  ) {
    const { itemsId, ...collectionData } = createWishListDto;
    const wishes = await this.wishesService.findManyById(itemsId);
    if (!wishes) {
      throw new NotFoundException(
        'Один или несколько элементов списка желаний не найдены.',
      );
    }
    const user = await this.usersService.findOne(currentUser.id);
    if (!user) {
      throw new NotFoundException('Пользователь не найден.');
    }

    return await this.wishlistsRepo.save({
      ...collectionData,
      owner: user,
      items: wishes,
    });
  }

  async deleteWishlistById(
    query: { id: number },
    currentUser: User,
  ): Promise<void> {
    const wishlist: Wishlist = await this.findWishlistById(query);

    if (wishlist.owner.id !== currentUser.id) {
      throw new ForbiddenException(
        'Вы не можете удалить список желаний другого пользователя.',
      );
    }
    await this.wishlistsRepo.delete(query.id);
  }
  async updateWishlistById(
    id: number,
    updateWishlistDto: CreateWishlistDto,
    currentUser: User,
  ): Promise<Wishlist> {
    const wishlist = await this.findWishlistById({ id });

    if (wishlist.owner.id !== currentUser.id) {
      throw new ForbiddenException(
        'Вы не можете обновить список желаний другого пользователя.',
      );
    }

    const { itemsId, ...collectionData } = updateWishlistDto;
    const wishes = itemsId
      ? await this.wishesService.findManyById(itemsId)
      : wishlist.items;
    if (!wishes) {
      throw new NotFoundException(
        'Один или несколько элементов списка желаний не найдены.',
      );
    }

    const updatedWishlist = this.wishlistsRepo.merge(wishlist, {
      ...collectionData,
      items: wishes,
    });

    return this.wishlistsRepo.save(updatedWishlist);
  }
}
