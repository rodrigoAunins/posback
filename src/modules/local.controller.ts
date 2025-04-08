import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Param,
    Body,
    NotFoundException,
    Query,
  } from '@nestjs/common';
  import { LocalService } from './local.service';
  import { Local } from '../entities/local.entity';
  import { OrderMap } from '../common/types';
  
  @Controller('locals')
  export class LocalController {
    constructor(private readonly localService: LocalService) {}
  
    @Get()
    findAll(
      @Query('limit') limit: string,
      @Query('offset') offset: string,
      @Query('order') order: string,
      @Query('searchTerm') searchTerm: string,
    ): Promise<Local[]> {
      const limitNum = limit ? parseInt(limit, 10) : undefined;
      const offsetNum = offset ? parseInt(offset, 10) : undefined;
  
      let orderOptions: OrderMap | undefined;
      if (order) {
        const [col, direction] = order.split(':');
        const dir = direction?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
        orderOptions = { [col]: dir };
      }
  
      return this.localService.findAll({
        limit: limitNum,
        offset: offsetNum,
        orderOptions,
        searchTerm,
      });
    }
  
    @Post()
    create(@Body() data: Partial<Local>): Promise<Local> {
      return this.localService.create(data);
    }
  
    @Put(':id')
    update(@Param('id') id: string, @Body() data: Partial<Local>): Promise<Local> {
      return this.localService.update(id, data);
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string) {
      const result = await this.localService.delete(id);
      if (!result) {
        throw new NotFoundException(`Local not found with id ${id}`);
      }
      return { deleted: true };
    }
  }
  