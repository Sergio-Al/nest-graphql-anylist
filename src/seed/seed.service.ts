import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/items/entities/item.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { SEED_ITEMS, SEED_USERS } from './data/seed-data';
import { UsersService } from 'src/users/users.service';
import { ItemsService } from 'src/items/items.service';
import { ListItem } from 'src/list-item/entities/list-item.entity';
import { List } from 'src/lists/entities/list.entity';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Item)
    private readonly itemsRepository: Repository<Item>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(ListItem)
    private readonly listItemsRepository: Repository<ListItem>,
    @InjectRepository(List)
    private readonly listsRepository: Repository<List>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
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
    await this.loadItems(user);
    // 4. Create lists

    // 5. Create list items

    return true;
  }

  async deleteDatabase() {
    // Clear listItems
    await this.listItemsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

    // Clear lists
    await this.listsRepository
      .createQueryBuilder()
      .delete()
      .where({})
      .execute();

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

  async loadUsers(): Promise<User> {
    const users = [];

    for (const user of SEED_USERS) {
      users.push(await this.usersService.create(user));
    }

    return users[0];
  }

  async loadItems(user: User): Promise<boolean> {
    const items = [];

    for (const item of SEED_ITEMS) {
      items.push(this.itemsService.create(item, user));
    }

    await Promise.all(items);
    return true;
  }
}
