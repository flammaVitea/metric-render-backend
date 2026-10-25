import { Controller, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findByQuery(@Query('username') username?: string) {
    if (!username) {
      return [];
    }
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      return [];
    }
    return [{ id: user.id, username: user.username }];
  }
}
