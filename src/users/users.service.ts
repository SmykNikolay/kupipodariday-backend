import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/createUser.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { FindUserDto } from './dto/findUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  validateHash(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new HttpException(
        'Пользователь с таким электронным адресом уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingUserByUsername = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });

    if (existingUserByUsername) {
      throw new HttpException(
        'Пользователь с таким именем пользователя уже существует',
        HttpStatus.BAD_REQUEST,
      );
    }

    createUserDto.password = await this.hashPassword(createUserDto?.password);
    const user = this.userRepository.create(createUserDto);
    return this.userRepository.save(user);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    return user;
  }

  async findMany(findUsersDto: FindUserDto) {
    const query = findUsersDto.query;
    const manyUsers = await this.userRepository.find({
      select: ['id', 'username', 'email'],
      where: [{ email: Like(`%${query}%`) }, { username: Like(`%${query}%`) }],
    });
    return manyUsers;
  }
  async findAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async findUserByName(username: string): Promise<User> {
    const user = await this.userRepository.findOneBy({ username });
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return await this.userRepository.findOneBy({ email });
  }

  async validateUniqueField(
    field: string,
    value: string,
    currentUserId: number,
  ) {
    const existingUser =
      field === 'username'
        ? await this.findUserByName(value)
        : await this.findByEmail(value);

    if (existingUser && existingUser.id !== currentUserId) {
      throw new BadRequestException(
        `Пользователь с таким ${field} уже существует`,
      );
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const user = await this.findOne(id);

      if (updateUserDto.username !== user.username) {
        await this.validateUniqueField('username', updateUserDto.username, id);
      }

      if (updateUserDto.email !== user.email) {
        await this.validateUniqueField('email', updateUserDto.email, id);
      }
      user.username = updateUserDto.username;
      user.email = updateUserDto.email;
      await this.create(user);
    } catch (error) {
      throw new BadRequestException(
        'Ошибка при обновлении пользователя: ' + error.message,
      );
    }
  }

  async remove(id: number) {
    return await this.userRepository.delete(id);
  }

  async findWishes(id: number): Promise<User[]> {
    const users = await this.userRepository.find({
      relations: { wishes: true },
      where: { id },
    });
    return users;
  }
}
