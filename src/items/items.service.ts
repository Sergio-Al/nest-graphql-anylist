import { Item } from './entities/item.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateItemInput } from './dto/inputs';
import { UpdateItemInput } from './dto/inputs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ItemsService {
  constructor(
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
  ) {}

  async create(createItemInput: CreateItemInput): Promise<Item> {
    const newItem = this.itemsRepository.create(createItemInput);
    return await this.itemsRepository.save(newItem);
  }

  async findAll(): Promise<Item[]> {
    // TODO: filter by user, pagination, etc.
    return this.itemsRepository.find();
  }

  async findOne(id: string): Promise<Item> {
    const item = await this.itemsRepository.findOneBy({ id });

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

  async remove(id: string): Promise<Item> {
    // TODO: make a soft delete to keep the data
    const item = await this.findOne(id);
    await this.itemsRepository.remove(item);

    return { ...item, id };
  }
}
