import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.userRepository.find();
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
