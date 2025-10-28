import { Module } from '@nestjs/common';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallController } from './video-call.controller';
import { VideoCallService } from './video-call.service';
import { FirebaseModule } from '../../../common/firebase/firebase.module';
import { UsersModule } from '../../../users/users.module';

@Module({
  imports: [FirebaseModule, UsersModule],
  controllers: [VideoCallController],
  providers: [VideoCallService, VideoCallQueueService],
  exports: [VideoCallService, VideoCallQueueService],
})
export class VideoCallModule {}

