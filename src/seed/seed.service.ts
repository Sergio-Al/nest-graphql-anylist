import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly usersService: UsersService,
  ) {
    this.isProd = configService.get('STATE') === 'PROD';
  }

  async executeSeed(): Promise<boolean> {
    if (this.isProd) {
      throw new Error('You cannot seed the database in production');
    }

    // Steps to seed the database
    // 1. Clear the database
    await this.deleteDatabase();
    // 2. Create users
    const user = await this.loadUsers();
    // 3. Create items

    return true;
  }

  async deleteDatabase() {
    // Clear items
    await this.itemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
    // Clear users
    await this.usersRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();
  }

  async loadUsers(): Promise<User[]> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }
}
