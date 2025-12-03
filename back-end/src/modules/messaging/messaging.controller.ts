import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';
import { GetConversationsDto } from './dto/get-conversations.dto';
import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('messaging')
@UseGuards(FirebaseAuthGuard)
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('send')
  async sendMessage(@Req() req: any, @Body() dto: SendMessageDto) {
    return await this.messagingService.sendMessage(req.user.id, dto);
  }

  @Get('conversations/partner')
  async getConversationsForPartner(
    @Req() req: any,
    @Query() dto: GetConversationsDto,
  ) {
    return await this.messagingService.getConversationsForPartner(
      req.user.id,
      dto.moduleType,
    );
  }

  @Get('conversations/user')
  async getConversationForUser(
    @Req() req: any,
    @Query() dto: GetConversationsDto,
  ) {
    return await this.messagingService.getConversationForUser(
      req.user.id,
      dto.moduleType,
    );
  }

  @Get('conversations/:conversationId/messages')
  async getMessages(@Req() req: any, @Param('conversationId') conversationId: string) {
    return await this.messagingService.getMessages(conversationId, req.user.id);
  }

  @Patch('messages/:messageId/read')
  async markAsRead(@Req() req: any, @Param('messageId') messageId: string) {
    return await this.messagingService.markAsRead(messageId, req.user.id);
  }

  @Get('unread-count')
  async getUnreadCount(@Req() req: any, @Query() dto: GetConversationsDto) {
    return await this.messagingService.getUnreadCount(req.user.id, dto.moduleType);
  }
}
