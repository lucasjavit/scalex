import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Question } from './question.entity';
import { UserProgress } from './user-progress.entity';

export enum LessonLevel {
  BEGINNER = 'beginner',
  ELEMENTARY = 'elementary',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

@Entity('english_lessons')
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_number', unique: true })
  lessonNumber: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: LessonLevel.BEGINNER,
  })
  level: LessonLevel;

  @Column({ name: 'grammar_focus', type: 'text', nullable: true })
  grammarFocus: string;

  @Column({ name: 'vocabulary_focus', type: 'text', array: true, nullable: true })
  vocabularyFocus: string[];

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Question, (question) => question.lesson)
  questions: Question[];

  @OneToMany(() => UserProgress, (progress) => progress.lesson)
  userProgress: UserProgress[];
}
