import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import { Public } from '@decorators/public.decorator';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DetailRequest } from '@utils/detail.request';
import { diskStorage } from 'multer';
import * as path from 'path';
import { DetailQuery } from './dto/query/detail.query';
import { ListItemQuery } from './dto/query/list-item.query';
import { CreateItemRequest } from './dto/request/create-item.request';
import { UpdateItemRequest } from './dto/request/update-item.request';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private itemService: ItemService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: async (req, file, cb) => {
          console.log('file', file);

          const filename: string = path
            .parse(file.originalname)
            .name.replace(/\s/g, '');
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${Date.now()}${extension}`);
        },
      }),
    }),
  )
  create(@Body() request: CreateItemRequest, @UploadedFiles() files) {
    return this.itemService.create(request, files);
  }

  @Public()
  @Get(':id')
  detail(@Param() request: DetailRequest, @Query() query: DetailQuery) {
    return this.itemService.detail({ ...request, ...query });
  }

  @Public()
  @Get()
  list(@Query() request: ListItemQuery) {
    return this.itemService.list(request);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param() request: DetailRequest) {
    return this.itemService.delete(request);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: './uploads',
        filename: async (req, file, cb) => {
          console.log('file', file);

          const filename: string = path
            .parse(file.originalname)
            .name.replace(/\s/g, '');
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${Date.now()}${extension}`);
        },
      }),
    }),
  )
  update(
    @Body() request: UpdateItemRequest,
    @Param() param: DetailRequest,
    @UploadedFiles() files: any,
  ) {
    return this.itemService.update({ ...request, ...param }, files);
  }
}
