import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';
import { SubmitReviewDto } from '../dto/submit-review.dto';
import { ReviewService } from '../services/review.service';

@Controller('api/english-course/review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  // Helper method to get userId from request
  private getUserId(request: any): string {
    if (request?.user?.id) return request.user.id;
    const userId = request?.headers?.['x-user-id'];
    if (userId) return userId;
    throw new Error('UserId not found. User must be authenticated.');
  }

  @Get('due')
  getDueCards(@Query('limit') limit?: string, @Req() request?: any) {
    const userId = this.getUserId(request);
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.reviewService.getDueCards(userId, limitNum);
  }

  @Post('submit')
  submitReview(@Body() submitReviewDto: SubmitReviewDto, @Req() request: any) {
    const userId = this.getUserId(request);
    return this.reviewService.submitReview(
      userId,
      submitReviewDto.cardId,
      submitReviewDto.result,
      submitReviewDto.timeTakenSeconds,
    );
  }

  @Get('stats')
  getStats(
    @Query('period') period?: 'today' | 'week' | 'month',
    @Req() request?: any,
  ) {
    const userId = this.getUserId(request);
    return this.reviewService.getReviewStats(userId, period);
  }
}
