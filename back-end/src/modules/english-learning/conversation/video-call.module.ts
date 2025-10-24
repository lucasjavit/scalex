import { Module } from '@nestjs/common';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallController } from './video-call.controller';
import { VideoCallService } from './video-call.service';

@Module({
  controllers: [VideoCallController],
  providers: [VideoCallService, VideoCallQueueService],
  exports: [VideoCallService, VideoCallQueueService],
})
export class VideoCallModule {}

