import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { ReviewService } from '../services/review.service';
import { SubmitReviewDto } from '../dto/submit-review.dto';

@Controller('api/english-course/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  getDueCards(@Query('limit') limit?: string) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.reviewService.getDueCards(userId, limitNum);
  }

  @Post('submit')
  submitReview(@Body() submitReviewDto: SubmitReviewDto) {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.reviewService.submitReview(
      userId,
      submitReviewDto.cardId,
      submitReviewDto.result,
      submitReviewDto.timeTakenSeconds,
    );
  }

  @Get('stats')
  getStats(@Query('period') period?: 'today' | 'week' | 'month') {
    const userId = 'd7da30e5-8c5a-4916-bac2-34dc92e63ffd';
    return this.reviewService.getReviewStats(userId, period);
  }
}
