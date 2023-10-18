import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '@components/auth/guards/jwt-auth.guard';
import { ReviewService } from './review.service';
import { CreateReviewRequest } from './dto/request/create-review.request';

@Controller('review')
export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  createCategory(@Body() request: CreateReviewRequest, @Request() req: any) {
    return this.reviewService.create(request, req.user);
  }
}
