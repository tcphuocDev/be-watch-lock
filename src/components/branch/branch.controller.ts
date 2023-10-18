import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
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
import { diskStorage } from 'multer';
import * as path from 'path';
import { BranchService } from './branch.service';
import { CreateBranchRequest } from './dto/request/create-branch.request';
import { DetailBranchRequest } from './dto/request/detail-branch.request';
import { ListBranchQuery } from './dto/query/list-branch.query';
import { UpdateBranchRequest } from './dto/request/update-branch.request';
import { Roles } from '@decorators/roles.decorator';
import { RoleEnum } from '@enums/role.enum';
import { Public } from '@decorators/public.decorator';

@Controller('branch')
export class BranchController {
  constructor(private branchService: BranchService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: async (req, file, cb) => {
          const filename: string = path
            .parse(file.originalname)
            .name.replace(/\s/g, '');
          const extension: string = path.parse(file.originalname).ext;

          cb(null, `${filename}${Date.now()}${extension}`);
        },
      }),
    }),
  )
  create(@Body() request: CreateBranchRequest, @UploadedFiles() files: any) {
    return this.branchService.create(request, files);
  }

  @Public()
  @Get()
  list(@Query() request: ListBranchQuery) {
    return this.branchService.list(request);
  }

  @UseGuards(JwtAuthGuard)
  // @Roles(RoleEnum.ADMIN)
  @Get(':id')
  detail(@Param() request: DetailBranchRequest) {
    return this.branchService.detail(request);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FilesInterceptor('images', 1, {
      storage: diskStorage({
        destination: './uploads',
        filename: async (req, file, cb) => {
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
    @Body() request: UpdateBranchRequest,
    @Param() param: DetailBranchRequest,
    @UploadedFiles() files: any,
  ) {
    return this.branchService.update({ ...request, ...param }, files);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  delete(@Param() request: DetailBranchRequest) {
    return this.branchService.delete(request);
  }

  @Public()
  @Post('/haha')
  demo(@Query() request: ListBranchQuery) {
    return this.branchService.list(request);
  }
}
