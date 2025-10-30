import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallController } from './video-call.controller';
import { VideoCallPublicController } from './video-call-public.controller';
import { VideoCallService } from './video-call.service';
import { FirebaseModule } from '../../../common/firebase/firebase.module';
import { UsersModule } from '../../../users/users.module';
import { VideoCallQueue } from './entities/video-call-queue.entity';
import { VideoCallSession } from './entities/video-call-session.entity';
import { VideoCallActivePeriod } from './entities/video-call-active-period.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([
      VideoCallQueue,
      VideoCallSession,
      VideoCallActivePeriod,
    ]),
    FirebaseModule,
    UsersModule,
  ],
  controllers: [VideoCallController, VideoCallPublicController],
  providers: [VideoCallService, VideoCallQueueService],
  exports: [VideoCallService, VideoCallQueueService],
})
export class VideoCallModule {}

