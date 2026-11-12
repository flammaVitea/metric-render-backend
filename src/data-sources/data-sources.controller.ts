import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DataSourceEntity } from './data-source.entity';
import { DataSourcesService } from './data-sources.service';
import { FileInterceptor } from '@nestjs/platform-express';

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        destination?: string;
        filename?: string;
        path?: string;
        buffer?: Buffer;
      }
    }
  }
}

// Застосовуємо захист токеном до всіх методів одразу
@UseGuards(JwtAuthGuard)
@Controller(['dataSources', 'data-sources'])
export class DataSourcesController {
  constructor(private readonly dataSourcesService: DataSourcesService) {}

  @Get()
  async findAll(@Req() req: any) {
    // Отримуємо джерела даних для всієї організації
    return this.dataSourcesService.findAll(req.user.organizationId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    return this.dataSourcesService.findOne(id, req.user.organizationId);
  }

  @Post()
  async create(@Body() body: Partial<DataSourceEntity>, @Req() req: any) {
    return this.dataSourcesService.create(body, req.user.organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user.organizationId);
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() body: Partial<DataSourceEntity>,
    @Req() req: any,
  ) {
    return this.dataSourcesService.update(id, body, req.user.organizationId);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() req: any) {
    await this.dataSourcesService.remove(id, req.user.organizationId);
    return {};
  }
  
  @Post('upload-csv')
    @UseInterceptors(FileInterceptor('file', {
      limits: {
        fileSize: 5 * 1024 * 1024, // Максимум 5 МБ
      },
      fileFilter: (req, file, callback) => {
        // Захист: пропускаємо лише файли з розширенням .csv
        if (!file.originalname.match(/\.(csv)$/i)) {
          return callback(new BadRequestException('Дозволені лише CSV файли'), false);
        }
        callback(null, true);
      },
    }))
    async uploadCsv(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
      if (!file) {
        throw new BadRequestException('Файл не знайдено');
      }
      
      // Передаємо файл у сервіс для збереження
      return this.dataSourcesService.saveUploadedCsv(file, req.user.orgId);
    }
  }