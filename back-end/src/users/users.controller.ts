import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { UsersService } from './users.service';
import { FirebaseAuthGuard } from '../common/guards/firebase-auth.guard';
import { AdminAccessGuard } from '../common/guards/admin-access.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ========================================
  // ADMIN ENDPOINTS (Must be BEFORE generic :id routes)
  // ========================================

  @Patch('admin/:userId/role')
  @UseGuards(FirebaseAuthGuard, AdminAccessGuard)
  @HttpCode(HttpStatus.OK)
  updateUserRole(
    @Param('userId') userId: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.usersService.updateUserRole(userId, updateUserRoleDto);
  }

  @Get('admin/roles/:role')
  @UseGuards(FirebaseAuthGuard, AdminAccessGuard)
  getUsersByRole(@Param('role') role: string) {
    return this.usersService.findUsersByRole(role);
  }

  // ========================================
  // SPECIFIC ROUTES (Before generic :id)
  // ========================================

  @Get('firebase/:firebaseUid')
  async findByFirebaseUid(@Param('firebaseUid') firebaseUid: string) {
    const user = await this.usersService.findByFirebaseUid(firebaseUid);
    // Return null as JSON for frontend to handle new user registration
    return user;
  }

  @Get('email/:email')
  findByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  // ========================================
  // GENERAL ROUTES
  // ========================================

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // ========================================
  // GENERIC :id ROUTES (Must be LAST)
  // ========================================

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/toggle-status')
  toggleStatus(@Param('id') id: string) {
    return this.usersService.toggleUserStatus(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // ========================================
  // ADDRESS MANAGEMENT
  // ========================================

  @Get(':id/addresses')
  getUserAddresses(@Param('id') id: string) {
    return this.usersService.getUserAddresses(id);
  }

  @Post(':id/addresses')
  @HttpCode(HttpStatus.CREATED)
  addAddress(
    @Param('id') id: string,
    @Body() createAddressDto: CreateAddressDto,
  ) {
    return this.usersService.addAddress(id, createAddressDto);
  }

  @Patch(':id/addresses/:addressId')
  updateAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(id, addressId, updateAddressDto);
  }

  @Delete(':id/addresses/:addressId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeAddress(
    @Param('id') id: string,
    @Param('addressId') addressId: string,
  ) {
    return this.usersService.removeAddress(id, addressId);
  }
}
