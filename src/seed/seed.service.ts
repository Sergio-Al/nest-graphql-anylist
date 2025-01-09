import { Injectable } from '@nestjs/common';

@Injectable()
export class SeedService {
  constructor() {}

  async executeSeed(): Promise<boolean> {
    // Steps to seed the database
    // 1. Clear the database
    // 2. Create users
    // 3. Create items

    return true;
  }
}
