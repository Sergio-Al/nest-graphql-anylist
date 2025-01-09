import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SeedService {
  private isProd: boolean;
  constructor(private readonly configService: ConfigService) {
    this.isProd = configService.get('STATE') === 'PROD';
  }

  async executeSeed(): Promise<boolean> {
    // Steps to seed the database
    // 1. Clear the database
    if (this.isProd) {
      throw new Error('You cannot seed the database in production');
    }

    // 2. Create users
    // 3. Create items

    return true;
  }
}
