import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import { CategoryService } from './category.service';
import { CreateCategoryRequest } from './dto/request/create-category.request';
import { GetCategoriesQuery } from './dto/query/get-categories.query';
import { UpdateCategoryRequest } from './dto/request/update-category.request';
import { DetailRequest } from '@utils/detail.request';
import { ListCategoryQuery } from './dto/query/list-category.query';
import { Public } from '@decorators/public.decorator';

@Controller('category')
export class CategoryController {
  constructor(private categoryService: CategoryService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createCategory(@Body() request: CreateCategoryRequest) {
    return this.categoryService.createCategory(request);
  }

  @Public()
  @Get()
  getCategories(@Query() request: GetCategoriesQuery) {
    return this.categoryService.getCategories(request);
  }

  @Public()
  @Get(':id')
  getCategory(@Param() request: DetailRequest) {
    return this.categoryService.getCategory(request);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateCategory(
    @Body() request: UpdateCategoryRequest,
    @Param() param: DetailRequest,
  ) {
    return this.categoryService.updateCategory({ ...request, ...param });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteCategory(@Param() request: DetailRequest) {
    return this.categoryService.deleteCategory(request);
  }
}
