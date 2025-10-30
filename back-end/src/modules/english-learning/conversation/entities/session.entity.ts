import { SessionRoom } from './session-room.entity';

export interface Session {
  sessionId: string;
  startTime: Date;
  endTime: Date | null;
  status: 'active' | 'ended';
  rooms: SessionRoom[];
  createdAt: Date;
}
