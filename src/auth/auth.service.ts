import { SignupInput } from './dto/inputs/signup.input';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from './../users/users.service';
import { LoginInput } from './dto/inputs';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(signInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signInput);
    // TODO: Generate a token
    const token = 'token';

    return { user, token };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid credentials');
    }

    // TODO: Generate a token

    const token = 'token';

    return { user, token };
  }
}
