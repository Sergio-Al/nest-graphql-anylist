import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UpdateUserInput } from './dto/update-user.input';
import { User } from './entities/user.entity';
import { SignupInput } from './../auth/dto/inputs/signup.input';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidRoles } from 'src/auth/enums/valid-roles.enum';
import { PaginationArgs, SearchArgs } from 'src/common/dto/args';

@Injectable()
export class UsersService {
  private logger: Logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(signupInput: SignupInput): Promise<User> {
    try {
      const newUser = this.usersRepository.create({
        ...signupInput,
        password: bcrypt.hashSync(signupInput.password, 10),
      });

      return await this.usersRepository.save(newUser);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  private createUserFilter(
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): SelectQueryBuilder<User> {
    const { search } = searchArgs;
    const { offset, limit } = paginationArgs;
    const query = this.usersRepository
      .createQueryBuilder()
      .take(limit)
      .skip(offset);

    if (search) {
      query.andWhere('LOWER(fullname) LIKE :fullname', {
        fullname: `%${search.toLocaleLowerCase()}%`,
      });
    }

    return query;
  }

  async findAll(
    roles: ValidRoles[],
    paginationArgs: PaginationArgs,
    searchArgs: SearchArgs,
  ): Promise<User[]> {
    if (roles.length === 0)
      return this.createUserFilter(paginationArgs, searchArgs).getMany();

    // This is because we can have ['admin', 'user'] or ['admin']
    const queryBuilderUser = this.createUserFilter(paginationArgs, searchArgs)
      .andWhere('ARRAY[roles] && ARRAY[:...roles]')
      .setParameter('roles', roles);

    return queryBuilderUser.getMany();
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch (error) {
      this.handleDBErrors({
        code: 'error--001',
        detail: `User ${email} not found`,
      });
    }
  }

  async findOneById(id: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch (error) {
      throw new NotFoundException(`User ${id} not found`);
      // this.handleDBErrors({
      //   code: 'error--001',
      //   detail: `User ${id} not found`,
      // });
    }
  }

  // TODO: updated by
  async update(
    id: string,
    updateUserInput: UpdateUserInput,
    updatedBy: User,
  ): Promise<User> {
    try {
      const user = await this.usersRepository.preload({
        ...updateUserInput,
        id,
      });
      user.lastUpdatedBy = updatedBy;

      return await this.usersRepository.save(user);
    } catch (error) {
      this.handleDBErrors(error);
    }
  }

  async block(id: string, blockedBy: User): Promise<User> {
    const userToBlock = await this.findOneById(id);
    userToBlock.isActive = false;
    userToBlock.lastUpdatedBy = blockedBy;

    return await this.usersRepository.save(userToBlock);
  }

  private handleDBErrors(error: any): never {
    this.logger.error(error);
    if (error.code === '23505') {
      throw new BadRequestException('User already exists');
    }

    if (error.code === 'error--001') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException(
      'Something went wrong, please check the logs',
    );
  }
}
