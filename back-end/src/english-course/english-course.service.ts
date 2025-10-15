import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
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

  async findAllLessons(level?: string, userId?: string): Promise<Lesson[]> {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .where('lesson.isActive = :isActive', { isActive: true })
      .orderBy('lesson.lessonNumber', 'ASC');

    if (level) {
      query.andWhere('lesson.level = :level', { level });
    }

    const lessons = await query.getMany();

    // If userId is provided, add access validation
    if (userId) {
      const userProgress = await this.progressRepository.find({
        where: { userId },
        order: { lessonId: 'ASC' }
      });

      const completedLessonIds = userProgress
        .filter(p => p.status === ProgressStatus.COMPLETED)
        .map(p => p.lessonId);

      // Add access validation to each lesson
      return lessons.map(lesson => ({
        ...lesson,
        isAccessible: this.canAccessLesson(lesson, completedLessonIds, lessons)
      }));
    }

    return lessons;
  }

  private canAccessLesson(lesson: Lesson, completedLessonIds: string[], allLessons: Lesson[]): boolean {
    // First lesson is always accessible
    if (lesson.lessonNumber === 1) {
      return true;
    }

    // Check if previous lesson in the same level is completed
    const previousLesson = allLessons.find(l => 
      l.level === lesson.level && 
      l.lessonNumber === lesson.lessonNumber - 1
    );

    if (previousLesson) {
      return completedLessonIds.includes(previousLesson.id);
    }

    // If no previous lesson in same level, check if any lesson in previous level is completed
    const levelOrder = ['beginner', 'elementary', 'intermediate', 'advanced'];
    const currentLevelIndex = levelOrder.indexOf(lesson.level);
    
    if (currentLevelIndex > 0) {
      const previousLevel = levelOrder[currentLevelIndex - 1];
      const previousLevelLessons = allLessons.filter(l => l.level === previousLevel);
      return previousLevelLessons.some(l => completedLessonIds.includes(l.id));
    }

    return true; // Fallback - allow access
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

  async findQuestionsByLesson(lessonId: string, userId?: string): Promise<Question[]> {
    // If no userId provided, return all questions (for admin purposes)
    if (!userId) {
      return await this.questionRepository.find({
        where: { lessonId },
        order: { questionNumber: 'ASC' },
      });
    }

    // For regular users, check if there are due reviews first
    const dueReviews = await this.getDueReviewsForLesson(userId, lessonId);
    
    if (dueReviews.length > 0) {
      // Return only questions that are due for review
      return dueReviews.map(review => review.question);
    }

    // If no due reviews, check lesson progress
    const progress = await this.progressRepository.findOne({
      where: { userId, lessonId },
    });

    if (!progress || progress.status === 'not_started') {
      // Lesson not started - return all questions for initial practice
      return await this.questionRepository.find({
        where: { lessonId },
        order: { questionNumber: 'ASC' },
      });
    }

    // Lesson in progress or completed but no due reviews - return empty array
    return [];
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

    // Auto-complete if accuracy is high enough and user has practiced enough
    // Require at least 5 attempts and 80% accuracy, or 100% accuracy with at least 1 attempt
    // OR if user has practiced all questions in the lesson (regardless of accuracy)
    const totalQuestions = await this.questionRepository.count({ where: { lessonId } });
    const hasPracticedAllQuestions = progress.totalAttempts >= totalQuestions;
    
    const shouldComplete = (progress.accuracyPercentage >= 80 && 
      (progress.totalAttempts >= 5 || (progress.accuracyPercentage === 100 && progress.totalAttempts >= 1))) ||
      hasPracticedAllQuestions;
    
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

  async submitCardDifficulty(userId: string, lessonId: string, questionId: string, difficulty: string) {
    // This method handles card difficulty submission for the spaced repetition system
    
    const question = await this.findQuestionById(questionId);
    
    // Save answer history for tracking (optional - for analytics)
    const answerHistory = this.answerHistoryRepository.create({
      userId,
      questionId: question.id,
      userAnswer: `Difficulty: ${difficulty}`, // Store difficulty as "answer"
      isCorrect: difficulty !== 'again', // 'again' is considered incorrect
      responseTimeSeconds: 0, // Could be tracked if needed
      feedback: `Card difficulty rated as: ${difficulty}`,
    });
    await this.answerHistoryRepository.save(answerHistory);

    // Update user progress based on difficulty
    const progress = await this.getLessonProgress(userId, lessonId);
    const newTotalAttempts = progress.totalAttempts + 1;
    const newCorrectAnswers = difficulty !== 'again' ? progress.correctAnswers + 1 : progress.correctAnswers;
    
    // Update progress
    await this.updateProgress(userId, lessonId, {
      correctAnswers: newCorrectAnswers,
      totalAttempts: newTotalAttempts,
    });

    // Create or update review entry for this specific question
    await this.createOrUpdateReview(userId, lessonId, questionId, difficulty);

    return {
      success: true,
      difficulty,
      feedback: `Card difficulty rated as: ${difficulty}`,
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

  async createOrUpdateReview(userId: string, lessonId: string, questionId: string, difficulty: string) {
    try {
      // Check if review already exists
      let review = await this.reviewRepository.findOne({
        where: { userId, questionId },
      });

      const now = new Date();
      let intervalDays: number = 1; // Default to 1 day
      let easeFactor: number = 2.5; // Default ease factor

      if (review) {
        // Update existing review with SM-2 algorithm
        const isCorrect = difficulty !== 'again';
        
        if (isCorrect) {
          // Anki-style intervals for correct answers
          if (difficulty === 'again') {
            intervalDays = 0; // 1 minute
          } else if (difficulty === 'hard') {
            intervalDays = 0; // 6 minutes
          } else if (difficulty === 'good') {
            if (review.reviewCount === 0) {
              intervalDays = 0; // 10 minutes (first time)
            } else if (review.reviewCount === 1) {
              intervalDays = 1; // 1 day (second time)
            } else {
              intervalDays = Math.round(review.intervalDays * review.easeFactor);
            }
          } else if (difficulty === 'easy') {
            intervalDays = 3; // 3 days
          }
          
          // Adjust ease factor based on difficulty (SM-2 algorithm)
          if (difficulty === 'hard') {
            easeFactor = Math.max(1.3, Number(review.easeFactor) - 0.2);
          } else if (difficulty === 'good') {
            easeFactor = Number(review.easeFactor); // Keep same
          } else if (difficulty === 'easy') {
            easeFactor = Math.min(3.0, Number(review.easeFactor) + 0.1);
          }
        } else {
          // "Again" - reset interval and decrease ease factor
          intervalDays = 0; // 1 minute
          easeFactor = Math.max(1.3, Number(review.easeFactor) - 0.2);
        }

        review.intervalDays = intervalDays;
        review.easeFactor = easeFactor;
        review.reviewCount += 1;
        review.lastReviewedAt = now;
        review.isDue = false;
      } else {
        // Create new review with initial values (Anki-style intervals)
        if (difficulty === 'again') {
          intervalDays = 0; // 1 minute (0.0007 days)
        } else if (difficulty === 'hard') {
          intervalDays = 0; // 6 minutes (0.004 days)
        } else if (difficulty === 'good') {
          intervalDays = 0; // 10 minutes (0.007 days)
        } else if (difficulty === 'easy') {
          intervalDays = 3; // 3 days
        }
        
        easeFactor = 2.5; // Default ease factor

        review = this.reviewRepository.create({
          userId,
          lessonId,
          questionId,
          intervalDays,
          easeFactor,
          reviewCount: 1,
          lastReviewedAt: now,
          isDue: false,
        });
      }

      // Calculate next review date
      const nextReviewDate = new Date();
      if (intervalDays === 0) {
        // For minute-based intervals (Again, Hard, Good first time)
        if (difficulty === 'again') {
          nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1); // 1 minute
        } else if (difficulty === 'hard') {
          nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 6); // 6 minutes
        } else if (difficulty === 'good' && review.reviewCount === 0) {
          nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 10); // 10 minutes
        }
      } else {
        // For day-based intervals
        nextReviewDate.setDate(nextReviewDate.getDate() + intervalDays);
      }
      review.nextReviewDate = nextReviewDate;

      await this.reviewRepository.save(review);

      return review;
    } catch (error) {
      console.error('❌ Error in createOrUpdateReview:', error);
      throw error;
    }
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

  // ============================================
  // ADMIN METHODS
  // ============================================

  // Lessons Admin CRUD
  async getAllLessonsForAdmin(): Promise<Lesson[]> {
    return await this.lessonRepository.find({
      relations: ['questions'],
      order: { lessonNumber: 'ASC' },
    });
  }

  async getLessonByIdForAdmin(id: string): Promise<Lesson> {
    const lesson = await this.lessonRepository.findOne({
      where: { id },
      relations: ['questions'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with ID ${id} not found`);
    }

    return lesson;
  }

  async createLessonForAdmin(createLessonDto: CreateLessonDto): Promise<Lesson> {
    // Check if lesson number already exists
    const existingLesson = await this.lessonRepository.findOne({
      where: { lessonNumber: createLessonDto.lessonNumber },
    });

    if (existingLesson) {
      throw new BadRequestException(`Lesson number ${createLessonDto.lessonNumber} already exists`);
    }

    const lesson = this.lessonRepository.create(createLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async updateLessonForAdmin(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
    const lesson = await this.getLessonByIdForAdmin(id);
    
    // Check if lesson number already exists (if being changed)
    if (updateLessonDto.lessonNumber && updateLessonDto.lessonNumber !== lesson.lessonNumber) {
      const existingLesson = await this.lessonRepository.findOne({
        where: { lessonNumber: updateLessonDto.lessonNumber },
      });

      if (existingLesson) {
        throw new BadRequestException(`Lesson number ${updateLessonDto.lessonNumber} already exists`);
      }
    }

    Object.assign(lesson, updateLessonDto);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLessonForAdmin(id: string): Promise<void> {
    const lesson = await this.getLessonByIdForAdmin(id);
    await this.lessonRepository.remove(lesson);
  }

  // Questions Admin CRUD
  async getQuestionsByLessonForAdmin(lessonId: string): Promise<Question[]> {
    return await this.questionRepository.find({
      where: { lessonId },
      relations: ['lesson'],
      order: { questionNumber: 'ASC' },
    });
  }

  async getQuestionByIdForAdmin(id: string): Promise<Question> {
    const question = await this.questionRepository.findOne({
      where: { id },
      relations: ['lesson'],
    });

    if (!question) {
      throw new NotFoundException(`Question with ID ${id} not found`);
    }

    return question;
  }

  async createQuestionForAdmin(createQuestionDto: CreateQuestionDto): Promise<Question> {
    // Verify lesson exists
    await this.getLessonByIdForAdmin(createQuestionDto.lessonId);

    // Check if question number already exists in this lesson
    const existingQuestion = await this.questionRepository.findOne({
      where: { 
        lessonId: createQuestionDto.lessonId,
        questionNumber: createQuestionDto.questionNumber,
      },
    });

    if (existingQuestion) {
      throw new BadRequestException(`Question number ${createQuestionDto.questionNumber} already exists in this lesson`);
    }

    const question = this.questionRepository.create(createQuestionDto);
    return await this.questionRepository.save(question);
  }

  async updateQuestionForAdmin(id: string, updateQuestionDto: UpdateQuestionDto): Promise<Question> {
    const question = await this.getQuestionByIdForAdmin(id);

    // Check if question number already exists in this lesson (if being changed)
    if (updateQuestionDto.questionNumber && updateQuestionDto.questionNumber !== question.questionNumber) {
      const existingQuestion = await this.questionRepository.findOne({
        where: { 
          lessonId: question.lessonId,
          questionNumber: updateQuestionDto.questionNumber,
        },
      });

      if (existingQuestion) {
        throw new BadRequestException(`Question number ${updateQuestionDto.questionNumber} already exists in this lesson`);
      }
    }

    Object.assign(question, updateQuestionDto);
    return await this.questionRepository.save(question);
  }

  async deleteQuestionForAdmin(id: string): Promise<void> {
    const question = await this.getQuestionByIdForAdmin(id);
    await this.questionRepository.remove(question);
  }

  // Bulk operations
  async createQuestionsBulkForAdmin(bulkCreateDto: any): Promise<{ created: number; questions: Question[] }> {
    const { lessonId, questions } = bulkCreateDto;
    
    // Verify lesson exists
    await this.getLessonByIdForAdmin(lessonId);

    const createdQuestions: Question[] = [];
    
    for (const questionData of questions) {
      // Check if question number already exists
      const existingQuestion = await this.questionRepository.findOne({
        where: { 
          lessonId,
          questionNumber: questionData.questionNumber,
        },
      });

      if (existingQuestion) {
        throw new BadRequestException(`Question number ${questionData.questionNumber} already exists in this lesson`);
      }

      const question = this.questionRepository.create({
        ...questionData,
        lessonId,
      });
      
      const savedQuestion = await this.questionRepository.save(question);
      if (Array.isArray(savedQuestion)) {
        createdQuestions.push(...savedQuestion);
      } else {
        createdQuestions.push(savedQuestion);
      }
    }

    return {
      created: createdQuestions.length,
      questions: createdQuestions,
    };
  }

  async deleteQuestionsBulkForAdmin(bulkDeleteDto: any): Promise<void> {
    const { questionIds } = bulkDeleteDto;
    
    await this.questionRepository.delete(questionIds);
  }

  // Admin Statistics
  async getAdminStatistics() {
    const totalLessons = await this.lessonRepository.count({ where: { isActive: true } });
    const totalQuestions = await this.questionRepository.count();
    const activeUsers = await this.progressRepository
      .createQueryBuilder('progress')
      .select('DISTINCT progress.userId')
      .where('progress.status IN (:...statuses)', { 
        statuses: [ProgressStatus.IN_PROGRESS, ProgressStatus.COMPLETED] 
      })
      .getCount();

    // Calculate average progress
    const allProgress = await this.progressRepository.find({
      where: { status: ProgressStatus.COMPLETED },
    });

    const averageProgress = allProgress.length > 0 
      ? allProgress.reduce((sum, p) => sum + p.accuracyPercentage, 0) / allProgress.length
      : 0;

    return {
      totalLessons,
      totalQuestions,
      activeUsers,
      averageProgress: Number(averageProgress.toFixed(2)),
    };
  }
}
