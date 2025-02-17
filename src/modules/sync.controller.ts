import { Controller, Post, Body } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private syncService: SyncService) {}

  @Post()
  async syncData(@Body() data: any) {
    // data = { users: [], categories: [], brands: [], products: [], sales: [] }
    return this.syncService.syncAll(data);
  }
}
