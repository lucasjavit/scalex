export interface VideoCallRoom {
  roomName: string;
  userId: string;
  createdBy: string;
  participants: string[];
  preferences: {
    topic: string;
    language: string;
    level: string;
    duration: number;
  };
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  status: 'waiting' | 'active' | 'ended';
  duration: number;
}
