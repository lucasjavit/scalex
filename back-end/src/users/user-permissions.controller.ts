import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserPermissionsService } from './user-permissions.service';
import { UpdateUserPermissionsDto } from './dto/update-user-permissions.dto';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';
import { CurrentUserId } from '../common/decorators/current-user.decorator';

@Controller('user-permissions')
@UseGuards(FirebaseAuthGuard)
export class UserPermissionsController {
  constructor(
    private readonly userPermissionsService: UserPermissionsService,
  ) {}

  @Get('me')
  async getMyPermissions(@CurrentUserId() userId: string) {
    return this.userPermissionsService.getUserPermissions(userId);
  }

  @Get('all')
  @UseGuards(AdminAccessGuard)
  async getAllUsersWithPermissions() {
    return this.userPermissionsService.getAllUsersWithPermissions();
  }

  @Get(':userId')
  @UseGuards(AdminAccessGuard)
  async getUserPermissions(@Param('userId') userId: string) {
    return this.userPermissionsService.getUserPermissions(userId);
  }

  @Patch(':userId')
  @UseGuards(AdminAccessGuard)
  @HttpCode(HttpStatus.OK)
  async updateUserPermissions(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserPermissionsDto,
  ) {
    return this.userPermissionsService.updateUserPermissions(userId, updateDto);
  }
}
