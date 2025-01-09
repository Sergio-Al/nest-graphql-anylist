import { Item } from './entities/item.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs';
import { UpdateItemInput } from './dto/inputs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput, user: User): Promise<Item> {
    const newItem = this.itemsRepository.create({ ...createItemInput, user });
    return await this.itemsRepository.save(newItem);
  }

  async findAll(user?: User): Promise<Item[]> {
    // TODO: filter by user, pagination, etc.
    return this.itemsRepository.find({
      where: {
        user: {
          id: user.id,
        },
      },
      relations: ['user'],
    });
  }

  async findOne(id: string, user: User): Promise<Item> {
    const item = await this.itemsRepository.findOne({
      where: {
        id,
        user: {
          id: user.id,
        },
      },
      relations: ['user'],
    });

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return item;
  }

  async update(id: string, updateItemInput: UpdateItemInput): Promise<Item> {
    const item = await this.itemsRepository.preload(updateItemInput);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    return await this.itemsRepository.save(item);
  }

  async remove(id: string, user: User): Promise<Item> {
    // TODO: make a soft delete to keep the data
    const item = await this.findOne(id, user);

    if (!item) {
      throw new NotFoundException('Item not found');
    }

    await this.itemsRepository.remove(item);

    return { ...item, id };
  }
}
