import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Local } from '../entities/local.entity';
import { OrderMap } from '../common/types';

interface FindAllParams {
  limit?: number;
  offset?: number;
  orderOptions?: OrderMap;
  searchTerm?: string;
}

@Injectable()
export class LocalService {
  constructor(
    @InjectRepository(Local)
    private readonly localRepository: Repository<Local>,
  ) {}

  async findAll(params: FindAllParams = {}): Promise<Local[]> {
    const { limit, offset, orderOptions, searchTerm } = params;

    const qb = this.localRepository.createQueryBuilder('local');

    // Evitar mostrar "locals" marcados como borrados.
    qb.where('local.deleted = false');

    // Filtro opcional por searchTerm (ejemplo: buscar por nombre o dirección).
    if (searchTerm) {
      qb.andWhere(
        '(local.name ILIKE :term OR local.address ILIKE :term)',
        { term: `%${searchTerm}%` },
      );
    }

    // Paginación
    if (limit) qb.take(limit);
    if (offset) qb.skip(offset);

    // Orden
    if (orderOptions) {
      Object.entries(orderOptions).forEach(([col, dir]) => {
        qb.addOrderBy(`local.${col}`, dir as 'ASC' | 'DESC');
      });
    }

    return qb.getMany();
  }

  async create(data: Partial<Local>): Promise<Local> {
    const local = this.localRepository.create(data);
    if (!local.id) {
      local.id = Date.now().toString();
    }
    local.updatedAt = new Date();
    return this.localRepository.save(local);
  }

  async update(id: string, data: Partial<Local>): Promise<Local> {
    const local = await this.localRepository.findOne({ where: { id } });
    if (!local) {
      throw new NotFoundException(`Local not found with id ${id}`);
    }
    Object.assign(local, data);
    local.updatedAt = new Date();
    return this.localRepository.save(local);
  }

  async delete(id: string): Promise<boolean> {
    const local = await this.localRepository.findOne({ where: { id } });
    if (!local) {
      return false;
    }
    // Si prefieres borrado lógico, pon local.deleted = true y haz .save()
    // local.deleted = true;
    // await this.localRepository.save(local);

    // O borrado físico:
    await this.localRepository.remove(local);
    return true;
  }
}
