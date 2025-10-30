import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { Address } from './entities/address.entity';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Validate birth date is not in the future
    const birthDate = new Date(createUserDto.birth_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison

    if (birthDate > today) {
      throw new BadRequestException('Birth date cannot be in the future');
    }

    // Check if user already exists by Firebase UID
    const existingUserByUid = await this.userRepository.findOne({
      where: { firebase_uid: createUserDto.firebase_uid },
    });

    if (existingUserByUid) {
      throw new ConflictException('User with this Firebase UID already exists');
    }

    // Check if user already exists by email
    const existingUserByEmail = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    // Create user
    const user = this.userRepository.create({
      firebase_uid: createUserDto.firebase_uid,
      email: createUserDto.email,
      full_name: createUserDto.full_name,
      birth_date: birthDate,
      phone: createUserDto.phone,
      preferred_language: createUserDto.preferred_language,
    });

    const savedUser = await this.userRepository.save(user);

    // Create addresses if provided
    if (createUserDto.addresses && createUserDto.addresses.length > 0) {
      const addresses = createUserDto.addresses.map((addressDto) =>
        this.addressRepository.create({
          ...addressDto,
          user: savedUser,
        }),
      );
      await this.addressRepository.save(addresses);
    }

    return this.findOne(savedUser.id);
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({
      relations: ['addresses'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { firebase_uid: firebaseUid },
      relations: ['addresses'],
    });

    // Return null instead of throwing error - frontend will handle user creation
    return user || null;
  }

  /**
   * Finds user by Firebase UID or email, and updates firebase_uid if pending
   * Used for first-time admin login
   */
  async findByFirebaseUidOrEmail(
    firebaseUid: string,
    email: string,
  ): Promise<User | null> {
    // First try to find by firebase_uid
    let user = await this.userRepository.findOne({
      where: { firebase_uid: firebaseUid },
      relations: ['addresses'],
    });

    if (user) {
      return user;
    }

    // Try to find by email with pending first login
    user = await this.userRepository.findOne({
      where: { email, firebase_uid: 'pending-first-login' },
      relations: ['addresses'],
    });

    if (user) {
      // Update firebase_uid for first-time login
      user.firebase_uid = firebaseUid;
      await this.userRepository.save(user);
      console.log(
        `✅ First admin login completed: ${email} linked to Firebase UID`,
      );
      return user;
    }

    return null;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    await this.userRepository.save(user);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  // Address management methods
  async addAddress(
    userId: string,
    createAddressDto: CreateAddressDto,
  ): Promise<Address> {
    const user = await this.findOne(userId);

    // If this address is being set as primary, ensure no other address is primary
    if (createAddressDto.is_primary) {
      await this.addressRepository
        .createQueryBuilder()
        .update(Address)
        .set({ is_primary: false })
        .where('user_id = :userId', { userId })
        .execute();
    }

    const address = this.addressRepository.create({
      ...createAddressDto,
      user,
    });

    return await this.addressRepository.save(address);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    updateAddressDto: UpdateAddressDto,
  ): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found for user ${userId}`,
      );
    }

    // If this address is being set as primary, ensure no other address is primary
    if (updateAddressDto.is_primary) {
      await this.addressRepository
        .createQueryBuilder()
        .update(Address)
        .set({ is_primary: false })
        .where('user_id = :userId AND id != :addressId', { userId, addressId })
        .execute();
    }

    Object.assign(address, updateAddressDto);
    return await this.addressRepository.save(address);
  }

  async removeAddress(userId: string, addressId: string): Promise<void> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundException(
        `Address with ID ${addressId} not found for user ${userId}`,
      );
    }

    await this.addressRepository.remove(address);
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    const user = await this.findOne(userId);
    return user.addresses;
  }

  async toggleUserStatus(userId: string): Promise<User> {
    const user = await this.findOne(userId);
    user.is_active = !user.is_active;
    return await this.userRepository.save(user);
  }

  // Admin: Update user role
  async updateUserRole(
    userId: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    const oldRole = user.role;
    user.role = updateUserRoleDto.role;

    const updatedUser = await this.userRepository.save(user);

    console.log(
      `[Admin] User ${userId} role changed: ${oldRole} → ${updateUserRoleDto.role}`,
    );

    return updatedUser;
  }

  // Admin: Get all users with specific role
  async findUsersByRole(role: string): Promise<User[]> {
    return await this.userRepository.find({
      where: { role: role as any },
      relations: ['addresses'],
      order: { created_at: 'DESC' },
    });
  }
}
