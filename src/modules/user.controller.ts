import { Controller, Get, Post, Body, Delete, Param, NotFoundException, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { OrderMap } from '../common/types';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  findAll(
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('order') order: string,
    @Query('localId') localId: string // 👈 agregado
  ): Promise<User[]> {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    const offsetNum = offset ? parseInt(offset, 10) : undefined;
    const localIdNum = localId ? parseInt(localId, 10) : undefined;

    let orderOptions: OrderMap | undefined = undefined;
    if (order) {
      const [col, direction] = order.split(':');
      const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      orderOptions = { [col]: dir };
    }

    return this.userService.findAll(limitNum, offsetNum, orderOptions, localIdNum); // 👈 se pasa
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
