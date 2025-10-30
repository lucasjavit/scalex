export interface SessionRoom {
  roomName: string;
  sessionId: string;
  user1: string; // userId
  user2: string; // userId
  level: string;
  createdAt: Date;
  endedAt: Date | null;
  status: 'active' | 'ended';
}
