export interface QueueUser {
  userId: string;
  level: string; // 'beginner', 'intermediate', 'advanced'
  preferences: {
    topic?: string;
    language?: string;
  };
  joinedAt: Date;
}
