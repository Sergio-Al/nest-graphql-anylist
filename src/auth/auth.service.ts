import { SignupInput } from './dto/inputs/signup.input';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BadRequestException, Injectable } from '@nestjs/common';
import { AuthResponse } from './types/auth-response.type';
import { UsersService } from './../users/users.service';
import { LoginInput } from './dto/inputs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private getJwtToken(userId: string) {
    return this.jwtService.sign({ id: userId });
  }

  async signup(signInput: SignupInput): Promise<AuthResponse> {
    const user = await this.usersService.create(signInput);

    const token = this.getJwtToken(user.id);

    return { user, token };
  }

  async login(loginInput: LoginInput): Promise<AuthResponse> {
    const { email, password } = loginInput;
    const user = await this.usersService.findOneByEmail(email);

    if (!bcrypt.compareSync(password, user.password)) {
      throw new BadRequestException('Invalid credentials');
    }

    const token = this.getJwtToken(user.id);

    return { user, token };
  }
}
