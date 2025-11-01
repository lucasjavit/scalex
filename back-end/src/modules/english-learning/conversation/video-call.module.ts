import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseModule } from '../../../common/firebase/firebase.module';
import { UsersModule } from '../../../users/users.module';
import { VideoCallActivePeriod } from './entities/video-call-active-period.entity';
import { VideoCallQueue } from './entities/video-call-queue.entity';
import { VideoCallSession } from './entities/video-call-session.entity';
import { VideoCallDailyService } from './video-call-daily.service';
import { VideoCallPublicController } from './video-call-public.controller';
import { VideoCallQueueService } from './video-call-queue.service';
import { VideoCallController } from './video-call.controller';
import { VideoCallService } from './video-call.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 10, // 10 requests per 60 seconds
      },
    ]),
    TypeOrmModule.forFeature([
      VideoCallQueue,
      VideoCallSession,
      VideoCallActivePeriod,
    ]),
    FirebaseModule,
    UsersModule,
  ],
  controllers: [VideoCallController, VideoCallPublicController],
  providers: [VideoCallService, VideoCallQueueService, VideoCallDailyService],
  exports: [VideoCallService, VideoCallQueueService, VideoCallDailyService],
})
export class VideoCallModule {}
