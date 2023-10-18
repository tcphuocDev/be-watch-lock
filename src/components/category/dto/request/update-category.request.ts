import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { CreateCategoryRequest } from './create-category.request';

export class UpdateCategoryRequest extends CreateCategoryRequest {}
