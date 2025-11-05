import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserPermissionsService } from './user-permissions.service';
import { UserPermissionsController } from './user-permissions.controller';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { UserPermission } from './entities/user-permission.entity';
import { FirebaseModule } from '../common/firebase/firebase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Address, UserPermission]),
    FirebaseModule,
  ],
  controllers: [UsersController, UserPermissionsController],
  providers: [UsersService, UserPermissionsService],
  exports: [UsersService, UserPermissionsService],
})
export class UsersModule {}
