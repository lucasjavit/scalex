import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Lesson } from './lesson.entity';
import { Question } from './question.entity';

@Entity('english_reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @Column({ name: 'review_count', default: 0 })
  reviewCount: number;

  @Column({ name: 'next_review_date' })
  nextReviewDate: Date;

  @Column({ name: 'interval_days', default: 1 })
  intervalDays: number;

  @Column({ name: 'ease_factor', type: 'decimal', precision: 3, scale: 2, default: 2.5 })
  easeFactor: number;

  @Column({ name: 'last_reviewed_at', nullable: true })
  lastReviewedAt: Date;

  @Column({ name: 'is_due', default: true })
  isDue: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Lesson, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @ManyToOne(() => Question, (question) => question.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question: Question;
}
