import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { SubmitAnswerDto } from './dto/submit-answer.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { AnswerHistory } from './entities/answer-history.entity';
import { Lesson } from './entities/lesson.entity';
import { Question } from './entities/question.entity';
import { Review } from './entities/review.entity';
import { ProgressStatus, UserProgress } from './entities/user-progress.entity';

@Injectable()
export class EnglishCourseService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepository: Repository<Lesson>,
    @InjectRepository(Question)
    private questionRepository: Repository<Question>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(AnswerHistory)
    private answerHistoryRepository: Repository<AnswerHistory>,
  ) {}

  // ============================================
  // LESSON METHODS
  // ============================================

  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async findAllLessons(level?: string): Promise<Lesson[]> {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .where('lesson.isActive = :isActive', { isActive: true })
      .orderBy('lesson.lessonNumber', 'ASC');

    if (level) {
      query.andWhere('lesson.level = :level', { level });
    }

    return await query.getMany();
  }

  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async updateLesson(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.findLessonById(id);
    await this.lessonRepository.remove(lesson);
  }

  // ============================================
  // QUESTION METHODS
  // ============================================

  async createQuestion(createQuestionDto: CreateQuestionDto): Promise<Question> {
    const lesson = await this.findLessonById(createQuestionDto.lessonId);
    const question = this.questionRepository.create(createQuestionDto);
    return await this.questionRepository.save(question);
  }

  async findQuestionsByLesson(lessonId: string): Promise<Question[]> {
    return await this.questionRepository.find({
      where: { lessonId },
      order: { questionNumber: 'ASC' },
    });
  }

  async findQuestionById(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['lesson'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async updateQuestion(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.findQuestionById(id);
    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(id: string): Promise<void> {
    const question = await this.findQuestionById(id);
    await this.questionRepository.remove(question);
  }

  // ============================================
  // USER PROGRESS METHODS
  // ============================================

  async getUserProgress(userId: string): Promise<UserProgress[]> {
    return await this.progressRepository.find({
      where: { userId },
      relations: ['lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  async getLessonProgress(userId: string, lessonId: string): Promise<UserProgress> {
    let progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
      relations: ['lesson'],
    });

    if (!progress) {
      // Create initial progress if doesn't exist
      progress = this.progressRepository.create({
        userId,
        lessonId,
        status: ProgressStatus.NOT_STARTED,
      });
      progress = await this.progressRepository.save(progress);
    }

    return progress;
  }

  async updateProgress(userId: string, lessonId: string, updateDto: UpdateProgressDto): Promise<UserProgress> {
    const progress = await this.getLessonProgress(userId, lessonId);
    const wasCompleted = progress.status === ProgressStatus.COMPLETED;
    
    Object.assign(progress, updateDto);

    // Calculate accuracy percentage
    if (progress.totalAttempts > 0) {
      progress.accuracyPercentage = Number(((progress.correctAnswers / progress.totalAttempts) * 100).toFixed(2));
    }

    progress.lastPracticedAt = new Date();

    // Auto-complete if accuracy is high enough
    // For lessons with fewer questions, complete if all questions are answered correctly
    const shouldComplete = progress.accuracyPercentage >= 80 && 
      (progress.totalAttempts >= 10 || progress.accuracyPercentage === 100);
    
    if (shouldComplete) {
      progress.status = ProgressStatus.COMPLETED;
      progress.completedAt = new Date();
      
      // Create initial reviews for spaced repetition if lesson was just completed
      if (!wasCompleted) {
        await this.createInitialReviews(userId, lessonId);
      }
    } else if (progress.totalAttempts > 0) {
      progress.status = ProgressStatus.IN_PROGRESS;
    }

    return await this.progressRepository.save(progress);
  }

  // ============================================
  // ANSWER SUBMISSION & CHECKING
  // ============================================

  async submitAnswer(userId: string, lessonId: string, submitAnswerDto: SubmitAnswerDto) {
    const question = await this.findQuestionById(submitAnswerDto.questionId);
    const userAnswer = submitAnswerDto.userAnswer.trim().toLowerCase();
    const expectedAnswer = question.expectedAnswer.trim().toLowerCase();

    // Check if answer is correct
    let isCorrect = userAnswer === expectedAnswer;

    // Check alternative answers if not correct
    if (!isCorrect && question.alternativeAnswers) {
      isCorrect = question.alternativeAnswers.some(
        (alt) => alt.trim().toLowerCase() === userAnswer,
      );
    }

    // Save answer history
    const answerHistory = this.answerHistoryRepository.create({
      userId,
      questionId: question.id,
      userAnswer: submitAnswerDto.userAnswer,
      isCorrect,
      responseTimeSeconds: submitAnswerDto.responseTimeSeconds,
      feedback: isCorrect ? 'Correct!' : `Expected: ${question.expectedAnswer}`,
    });
    await this.answerHistoryRepository.save(answerHistory);

    // Update user progress
    const progress = await this.getLessonProgress(userId, lessonId);
    progress.totalAttempts++;
    if (isCorrect) {
      progress.correctAnswers++;
    }
    await this.updateProgress(userId, lessonId, {
      correctAnswers: progress.correctAnswers,
      totalAttempts: progress.totalAttempts,
    });

    return {
      isCorrect,
      correctAnswer: question.expectedAnswer,
      feedback: answerHistory.feedback,
      accuracy: progress.accuracyPercentage,
      questionId: question.id,
    };
  }

  async submitDifficulty(userId: string, lessonId: string, questionId: string, difficulty: string) {
    // Anki-style difficulty mapping
    // again: < 1 min (1 minute = 0.000694 days)
    // hard: < 10 min (10 minutes = 0.00694 days)
    // good: < 4 days
    // easy: < 7 days

    let review = await this.reviewRepository.findOne({
      where: { userId, questionId },
    });

    if (!review) {
      // Create new review
      review = this.reviewRepository.create({
        userId,
        lessonId,
        questionId,
        reviewCount: 0,
        nextReviewDate: new Date(),
        intervalDays: 0,
        easeFactor: 2.5,
        lastReviewedAt: new Date(),
        isDue: false,
      });
    }

    review.reviewCount++;
    review.lastReviewedAt = new Date();

    // Anki-style scheduling based on difficulty
    switch (difficulty.toLowerCase()) {
      case 'again':
        // Forgot the card - reset to beginning
        review.intervalDays = 0.000694; // 1 minute
        review.easeFactor = Math.max(1.3, review.easeFactor - 0.2);
        review.isDue = true; // Show again in this session
        break;

      case 'hard':
        // Difficult but remembered
        if (review.reviewCount === 1) {
          review.intervalDays = 0.00694; // 10 minutes
        } else {
          review.intervalDays = Math.max(1, review.intervalDays * 1.2);
        }
        review.easeFactor = Math.max(1.3, review.easeFactor - 0.15);
        review.isDue = false; // Not due until next review date
        break;

      case 'good':
        // Standard Anki SM-2 progression
        if (review.reviewCount === 1) {
          review.intervalDays = 1; // 1 day
        } else if (review.reviewCount === 2) {
          review.intervalDays = 4; // 4 days
        } else {
          review.intervalDays = Math.round(review.intervalDays * review.easeFactor);
        }
        review.isDue = false; // Not due until next review date
        break;

      case 'easy':
        // Easy - longer interval
        if (review.reviewCount === 1) {
          review.intervalDays = 4; // 4 days
        } else {
          review.intervalDays = Math.round(review.intervalDays * review.easeFactor * 1.3);
        }
        review.easeFactor = Math.min(3.0, review.easeFactor + 0.15);
        review.isDue = false; // Not due until next review date
        break;

      default:
        throw new BadRequestException('Invalid difficulty value. Must be: again, hard, good, or easy');
    }

    review.nextReviewDate = this.calculateNextReviewDate(review.intervalDays, review.easeFactor);
    await this.reviewRepository.save(review);

    // Update lesson progress
    const isCorrect = difficulty.toLowerCase() !== 'again';
    await this.updateProgress(userId, lessonId, {
      correctAnswers: isCorrect ? 1 : 0,
      totalAttempts: 1,
    });

    return {
      success: true,
      nextReviewDate: review.nextReviewDate,
      intervalDays: review.intervalDays,
      easeFactor: review.easeFactor,
    };
  }

  // ============================================
  // REVIEW METHODS (Spaced Repetition)
  // ============================================

  async getDueReviews(userId: string, limit: number = 20): Promise<Review[]> {
    // First, mark reviews as due if their next review date has passed
    await this.markReviewsAsDue();
    
    const now = new Date();
    
    return await this.reviewRepository.find({
      where: {
        userId,
        isDue: true,
        nextReviewDate: LessThan(now),
      },
      relations: ['question', 'lesson'],
      order: { nextReviewDate: 'ASC' },
      take: limit,
    });
  }


  private async updateReviewSchedule(
    userId: string,
    lessonId: string,
    questionId: string,
    isCorrect: boolean,
  ): Promise<void> {
    let review = await this.reviewRepository.findOne({
      where: { userId, questionId },
    });

    if (!review) {
      // Create new review - first time answering this question
      review = this.reviewRepository.create({
        userId,
        lessonId,
        questionId,
        reviewCount: 1,
        nextReviewDate: this.calculateNextReviewDate(1, 2.5),
        intervalDays: 1,
        easeFactor: 2.5,
        lastReviewedAt: new Date(),
        isDue: false, // Not due until next review date
      });
    } else {
      // Update existing review using SM-2 algorithm
      review.reviewCount++;
      review.lastReviewedAt = new Date();

      if (isCorrect) {
        // Correct answer - increase interval
        if (review.reviewCount === 1) {
          review.intervalDays = 1;
        } else if (review.reviewCount === 2) {
          review.intervalDays = 6;
        } else {
          review.intervalDays = Math.round(review.intervalDays * review.easeFactor);
        }
        review.easeFactor = Math.min(3.0, review.easeFactor + 0.1);
      } else {
        // Wrong answer - reset interval
        review.intervalDays = 1;
        review.easeFactor = Math.max(1.3, review.easeFactor - 0.2);
      }

      review.nextReviewDate = this.calculateNextReviewDate(review.intervalDays, review.easeFactor);
      review.isDue = false; // Not due until next review date
    }

    await this.reviewRepository.save(review);
  }

  private calculateNextReviewDate(intervalDays: number, easeFactor: number): Date {
    const now = new Date();
    now.setDate(now.getDate() + intervalDays);
    return now;
  }

  async markReviewsAsDue(): Promise<void> {
    const now = new Date();
    await this.reviewRepository
      .createQueryBuilder()
      .update(Review)
      .set({ isDue: true })
      .where('nextReviewDate <= :now', { now })
      .andWhere('isDue = :isDue', { isDue: false })
      .execute();
  }

  // Helper method to check if a review should be due
  private isReviewDue(review: Review): boolean {
    const now = new Date();
    return review.isDue && review.nextReviewDate <= now;
  }

  // Public method to create reviews for a lesson (for testing/debugging)
  async createReviewsForLesson(userId: string, lessonId: string): Promise<{ message: string; reviewsCreated: number }> {
    await this.createInitialReviews(userId, lessonId);
    
    // Count created reviews
    const reviews = await this.reviewRepository.find({
      where: { userId, lessonId },
    });
    
    return {
      message: `Reviews created for lesson ${lessonId}`,
      reviewsCreated: reviews.length
    };
  }

  // Get all reviews for a user (for debugging)
  async getAllReviews(userId: string): Promise<Review[]> {
    return await this.reviewRepository.find({
      where: { userId },
      relations: ['question', 'lesson'],
      order: { createdAt: 'DESC' },
    });
  }

  // Get due reviews for a specific lesson
  async getDueReviewsForLesson(userId: string, lessonId: string, limit: number = 20): Promise<Review[]> {
    // First, mark reviews as due if their next review date has passed
    await this.markReviewsAsDue();
    
    const now = new Date();
    
    return await this.reviewRepository.find({
      where: {
        userId,
        lessonId,
        isDue: true,
        nextReviewDate: LessThan(now),
      },
      relations: ['question', 'lesson'],
      order: { nextReviewDate: 'ASC' },
      take: limit,
    });
  }

  // Create initial reviews for all questions in a lesson when completed
  private async createInitialReviews(userId: string, lessonId: string): Promise<void> {
    const questions = await this.questionRepository.find({
      where: { lessonId },
    });

    for (const question of questions) {
      // Check if review already exists
      const existingReview = await this.reviewRepository.findOne({
        where: { userId, questionId: question.id },
      });

      if (!existingReview) {
        // Create initial review entry
        const review = this.reviewRepository.create({
          userId,
          lessonId,
          questionId: question.id,
          reviewCount: 0,
          nextReviewDate: new Date(), // Available immediately for first review
          intervalDays: 1,
          easeFactor: 2.5,
          lastReviewedAt: undefined,
          isDue: true, // Available for review
        });

        await this.reviewRepository.save(review);
      }
    }
  }

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  async getUserStatistics(userId: string) {
    const progress = await this.getUserProgress(userId);
    const totalLessons = await this.lessonRepository.count({ where: { isActive: true } });
    const completedLessons = progress.filter((p) => p.status === ProgressStatus.COMPLETED).length;
    const inProgressLessons = progress.filter((p) => p.status === ProgressStatus.IN_PROGRESS).length;

    const totalAttempts = progress.reduce((sum, p) => sum + p.totalAttempts, 0);
    const totalCorrect = progress.reduce((sum, p) => sum + p.correctAnswers, 0);
    const overallAccuracy = totalAttempts > 0 ? Number(((totalCorrect / totalAttempts) * 100).toFixed(2)) : 0;

    const dueReviews = await this.reviewRepository.count({
      where: {
        userId,
        isDue: true,
        nextReviewDate: LessThan(new Date()),
      },
    });

    return {
      totalLessons,
      completedLessons,
      inProgressLessons,
      notStartedLessons: totalLessons - completedLessons - inProgressLessons,
      totalAttempts,
      totalCorrect,
      overallAccuracy,
      dueReviews,
      progressPercentage: totalLessons > 0 ? Number(((completedLessons / totalLessons) * 100).toFixed(2)) : 0,
    };
  }

  async getAnswerHistory(userId: string, limit: number = 50): Promise<AnswerHistory[]> {
    return await this.answerHistoryRepository.find({
      where: { userId },
      relations: ['question', 'question.lesson'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
