import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnglishCourseController } from './english-course.controller';
import { EnglishCourseService } from './english-course.service';
import { Lesson } from './entities/lesson.entity';
import { Question } from './entities/question.entity';
import { UserProgress } from './entities/user-progress.entity';
import { Review } from './entities/review.entity';
import { AnswerHistory } from './entities/answer-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Lesson,
      Question,
      UserProgress,
      Review,
      AnswerHistory,
    ]),
  ],
  controllers: [EnglishCourseController],
  providers: [EnglishCourseService],
  exports: [EnglishCourseService],
})
export class EnglishCourseModule {}
