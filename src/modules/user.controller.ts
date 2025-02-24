import { Controller, Get, Post, Body, Delete, Param, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Post()
  create(@Body() userData: Partial<User>): Promise<User> {
    return this.userService.create(userData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.userService.delete(id);
    if (!result) {
      throw new NotFoundException(`User not found with id ${id}`);
    }
    return { deleted: true };
  }
}
