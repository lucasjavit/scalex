import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { User } from '../../users/entities/user.entity';
import { UserPermission } from '../../users/entities/user-permission.entity';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { FirebaseModule } from '../../common/firebase/firebase.module';
import { UsersModule } from '../../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, User, UserPermission]),
    FirebaseModule,
    UsersModule,
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
