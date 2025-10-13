import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { EnglishCourseService } from './english-course.service';

@Controller('english-course')
export class EnglishCourseController {
  constructor(private readonly englishCourseService: EnglishCourseService) {}

  // ============================================
  // LESSON ENDPOINTS
  // ============================================

  @Post('lessons')
  createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.englishCourseService.createLesson(createLessonDto);
  }

  @Get('lessons')
  findAllLessons(@Query('level') level?: string) {
    return this.englishCourseService.findAllLessons(level);
  }

  @Get('lessons/:id')
  findLessonById(@Param('id', ParseUUIDPipe) id: string) {
    return this.englishCourseService.findLessonById(id);
  }

  @Patch('lessons/:id')
  updateLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.englishCourseService.updateLesson(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLesson(@Param('id', ParseUUIDPipe) id: string) {
    return this.englishCourseService.deleteLesson(id);
  }

  // ============================================
  // QUESTION ENDPOINTS
  // ============================================

  @Post('questions')
  createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.englishCourseService.createQuestion(createQuestionDto);
  }

  @Get('lessons/:lessonId/questions')
  findQuestionsByLesson(@Param('lessonId', ParseUUIDPipe) lessonId: string) {
    return this.englishCourseService.findQuestionsByLesson(lessonId);
  }


  @Get('questions/:id')
  findQuestionById(@Param('id', ParseUUIDPipe) id: string) {
    return this.englishCourseService.findQuestionById(id);
  }

  @Patch('questions/:id')
  updateQuestion(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.englishCourseService.updateQuestion(id, updateQuestionDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteQuestion(@Param('id', ParseUUIDPipe) id: string) {
    return this.englishCourseService.deleteQuestion(id);
  }

  // ============================================
  // USER PROGRESS ENDPOINTS
  // ============================================

  @Get('users/:userId/progress')
  getUserProgress(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.englishCourseService.getUserProgress(userId);
  }

  @Get('users/:userId/lessons/:lessonId/progress')
  getLessonProgress(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.englishCourseService.getLessonProgress(userId, lessonId);
  }

  @Patch('users/:userId/lessons/:lessonId/progress')
  updateProgress(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() updateProgressDto: UpdateProgressDto,
  ) {
    return this.englishCourseService.updateProgress(userId, lessonId, updateProgressDto);
  }

  // ============================================
  // PRACTICE & ANSWER SUBMISSION
  // ============================================

  @Post('users/:userId/lessons/:lessonId/submit-answer')
  submitAnswer(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Body() submitAnswerDto: SubmitAnswerDto,
  ) {
    return this.englishCourseService.submitAnswer(userId, lessonId, submitAnswerDto);
  }

  @Post('users/:userId/lessons/:lessonId/questions/:questionId/difficulty')
  @HttpCode(HttpStatus.OK)
  submitDifficulty(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Param('questionId', ParseUUIDPipe) questionId: string,
    @Body('difficulty') difficulty: string,
  ) {
    return this.englishCourseService.submitDifficulty(userId, lessonId, questionId, difficulty);
  }

  // ============================================
  // REVIEW ENDPOINTS (Spaced Repetition)
  // ============================================

  @Get('users/:userId/reviews/due')
  getDueReviews(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.englishCourseService.getDueReviews(userId, limit || 20);
  }


  @Post('reviews/mark-due')
  @HttpCode(HttpStatus.OK)
  markReviewsAsDue() {
    return this.englishCourseService.markReviewsAsDue();
  }

  @Post('users/:userId/lessons/:lessonId/create-reviews')
  @HttpCode(HttpStatus.OK)
  createReviewsForLesson(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
  ) {
    return this.englishCourseService.createReviewsForLesson(userId, lessonId);
  }

  @Get('users/:userId/reviews/all')
  getAllReviews(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.englishCourseService.getAllReviews(userId);
  }

  @Get('users/:userId/lessons/:lessonId/reviews/due')
  getDueReviewsForLesson(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @Query('limit') limit?: number,
  ) {
    return this.englishCourseService.getDueReviewsForLesson(userId, lessonId, limit || 20);
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  @Get('users/:userId/statistics')
  getUserStatistics(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.englishCourseService.getUserStatistics(userId);
  }

  @Get('users/:userId/answer-history')
  getAnswerHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.englishCourseService.getAnswerHistory(userId, limit || 50);
  }
}
