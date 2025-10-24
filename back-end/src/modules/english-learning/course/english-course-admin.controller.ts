import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    Post,
    Put
} from '@nestjs/common';
import { UsersService } from '../../../users/users.service';
import { BulkCreateQuestionsDto } from './dto/bulk-create-questions.dto';
import { BulkDeleteQuestionsDto } from './dto/bulk-delete-questions.dto';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { EnglishCourseService } from './english-course.service';

@Controller('english-course/admin')
export class EnglishCourseAdminController {
  constructor(
    private readonly englishCourseService: EnglishCourseService,
    private readonly usersService: UsersService,
  ) {}

  // Lessons CRUD
  @Get('lessons')
  async getAllLessons() {
    return this.englishCourseService.getAllLessonsForAdmin();
  }

  @Get('lessons/:id')
  async getLessonById(@Param('id') id: string) {
    return this.englishCourseService.getLessonByIdForAdmin(id);
  }

  @Post('lessons')
  @HttpCode(HttpStatus.CREATED)
  async createLesson(@Body() createLessonDto: CreateLessonDto) {
    return this.englishCourseService.createLessonForAdmin(createLessonDto);
  }

  @Put('lessons/:id')
  async updateLesson(
    @Param('id') id: string,
    @Body() updateLessonDto: UpdateLessonDto,
  ) {
    return this.englishCourseService.updateLessonForAdmin(id, updateLessonDto);
  }

  @Delete('lessons/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLesson(@Param('id') id: string) {
    return this.englishCourseService.deleteLessonForAdmin(id);
  }

  // Questions CRUD
  @Get('lessons/:lessonId/questions')
  async getQuestionsByLesson(@Param('lessonId') lessonId: string) {
    return this.englishCourseService.getQuestionsByLessonForAdmin(lessonId);
  }

  @Get('questions/:id')
  async getQuestionById(@Param('id') id: string) {
    return this.englishCourseService.getQuestionByIdForAdmin(id);
  }

  @Post('questions')
  @HttpCode(HttpStatus.CREATED)
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
    return this.englishCourseService.createQuestionForAdmin(createQuestionDto);
  }

  @Put('questions/:id')
  async updateQuestion(
    @Param('id') id: string,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ) {
    return this.englishCourseService.updateQuestionForAdmin(id, updateQuestionDto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    return this.englishCourseService.deleteQuestionForAdmin(id);
  }

  // Bulk operations
  @Post('questions/bulk')
  @HttpCode(HttpStatus.CREATED)
  async createQuestionsBulk(@Body() bulkCreateDto: BulkCreateQuestionsDto) {
    return this.englishCourseService.createQuestionsBulkForAdmin(bulkCreateDto);
  }

  @Delete('questions/bulk')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestionsBulk(@Body() bulkDeleteDto: BulkDeleteQuestionsDto) {
    return this.englishCourseService.deleteQuestionsBulkForAdmin(bulkDeleteDto);
  }

  // Statistics
  @Get('statistics')
  async getAdminStatistics() {
    return this.englishCourseService.getAdminStatistics();
  }

  // Users management
  @Get('users')
  async getAllUsers() {
    return this.usersService.findAll();
  }

  @Put('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }
}
