import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { OrderMap } from '../common/types';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(limit?: number, offset?: number, orderOptions?: OrderMap): Promise<User[]> {
    const options: any = {};
    if (limit) options.take = limit;
    if (offset) options.skip = offset;
    if (orderOptions) options.order = orderOptions;
    return this.userRepository.find(options);
  }

  async create(data: Partial<User>): Promise<User> {
    const user = this.userRepository.create(data);
    if (!user.id) {
      user.id = Date.now().toString();
    }
    user.updatedAt = new Date();
    return this.userRepository.save(user);
  }

  async delete(id: string): Promise<boolean> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      return false;
    }
    await this.userRepository.remove(user);
    return true;
  }
}
