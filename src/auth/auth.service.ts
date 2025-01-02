import { SignupInput } from './dto/inputs/signup.input';
import { Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from './../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  async signup(signInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signInput);
    // TODO: Generate a token
    const token = 'token';

    return { user, token };
  }
}
