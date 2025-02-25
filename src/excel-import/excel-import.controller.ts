import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ExcelImportService, ExcelImportMappingDto } from './excel-import.service';

@Controller('admin/excel-import')
export class ExcelImportController {
  constructor(private readonly excelImportService: ExcelImportService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async importExcel(
    @UploadedFile() file: any, // Se usa 'any' para evitar problemas con los tipos de Multer
    @Body() mapping: ExcelImportMappingDto
  ) {
    const summary = await this.excelImportService.importExcel(file, mapping);
    return summary;
  }
}
