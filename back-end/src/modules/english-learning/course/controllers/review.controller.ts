import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../../../common/decorators/current-user.decorator';
import { FirebaseAuthGuard } from '../../../../common/guards/firebase-auth.guard';
import { EnglishLearningAccessGuard } from '../../../../common/guards/english-learning-access.guard';
import { SubmitReviewDto } from '../dto/submit-review.dto';
import { ReviewService } from '../services/review.service';

@Controller('english-course/review')
@UseGuards(FirebaseAuthGuard, EnglishLearningAccessGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get('due')
  getDueCards(
    @Query('limit') limit: string | undefined,
    @CurrentUser('id') userId: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.reviewService.getDueCards(userId, limitNum);
  }

  @Post('submit')
  submitReview(
    @Body() submitReviewDto: SubmitReviewDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.submitReview(
      userId,
      submitReviewDto.cardId,
      submitReviewDto.result,
      submitReviewDto.timeTakenSeconds,
    );
  }

  @Get('stats')
  getStats(
    @Query('period') period: 'today' | 'week' | 'month' | undefined,
    @CurrentUser('id') userId: string,
  ) {
    return this.reviewService.getReviewStats(userId, period);
  }
}
