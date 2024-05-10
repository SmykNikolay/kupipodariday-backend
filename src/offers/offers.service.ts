import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateOfferDto } from './dto/createOffer.dto';
import { WishesService } from 'src/wishes/wishes.service';
import { Offer } from './entities/offer.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class OffersService {
  constructor(
    @InjectRepository(Offer)
    private offerRepo: Repository<Offer>,
    private readonly wishesService: WishesService,
  ) {}

  async findAllOffers(query?) {
    return this.offerRepo.find({
      where: query,
      relations: ['user', 'item'],
    });
  }

  async findOfferById(query) {
    const offer = await this.offerRepo.findOneBy(query);
    if (!offer) {
      throw new NotFoundException(`Предложение с ID ${query.id} ушло в туман.`);
    }
    return offer;
  }

  async createOffer(user: User, createOfferDto: CreateOfferDto) {
    const wish = await this.wishesService.findById(createOfferDto.itemId, [
      'owner',
    ]);

    if (user.id === wish.owner.id) {
      throw new ForbiddenException('Самому себе подарки не делаем');
    }
    if (wish.price - wish.raised < createOfferDto.amount) {
      throw new ForbiddenException(
        'Пытаетесь внести сумму, превышающую стоимость подарка',
      );
    }

    wish.raised += createOfferDto.amount;

    const offer = this.offerRepo.create({
      ...createOfferDto,
      user: user,
      item: wish,
    });

    await this.wishesService.updateRaisedId(wish.id, wish);
    return this.offerRepo.save(offer);
  }
}
