import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { AnswerHistory } from './answer-history.entity';
import { Lesson } from './lesson.entity';
import { Review } from './review.entity';

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('english_questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'lesson_id' })
  lessonId: string;

  @Column({ name: 'question_number' })
  questionNumber: number;

  @Column({ name: 'front_text', type: 'text' })
  frontText: string;

  @Column({ name: 'back_text', type: 'text' })
  backText: string;

  @Column({ name: 'grammar_point', length: 255, nullable: true })
  grammarPoint: string;

  @Column({
    type: 'varchar',
    length: 20,
    default: QuestionDifficulty.MEDIUM,
  })
  difficulty: QuestionDifficulty;

  @Column({ name: 'audio_url', length: 500, nullable: true })
  audioUrl: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Lesson, (lesson) => lesson.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  lesson: Lesson;

  @OneToMany(() => Review, (review) => review.question)
  reviews: Review[];

  @OneToMany(() => AnswerHistory, (history) => history.question)
  answerHistory: AnswerHistory[];
}
