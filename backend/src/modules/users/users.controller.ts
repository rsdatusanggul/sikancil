import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFiscalYearDto } from './dto/update-fiscal-year.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard) // ✅ Protect all endpoints
@UseInterceptors(ClassSerializerInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('super_admin', 'admin') // ✅ Only admins can create users
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'Username or email already exists' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('super_admin', 'admin') // ✅ Only admins can list users
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('super_admin', 'admin') // ✅ Only admins can view user details
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('super_admin', 'admin') // ✅ Only admins can update users
  @ApiOperation({ summary: 'Update user by ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('super_admin') // ✅ Only super_admin can delete users
  @ApiOperation({ summary: 'Delete user by ID (soft delete)' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch('me/fiscal-year')
  @ApiOperation({ summary: 'Update current user active fiscal year' })
  @ApiResponse({ status: 200, description: 'Fiscal year updated successfully' })
  @ApiResponse({ status: 404, description: 'User or fiscal year not found' })
  updateMyFiscalYear(@Request() req, @Body() updateFiscalYearDto: UpdateFiscalYearDto) {
    return this.usersService.updateActiveFiscalYear(req.user.sub, updateFiscalYearDto.fiscalYearId);
  }

  @Patch(':id/fiscal-year')
  @Roles('super_admin', 'admin') // ✅ Only admins can update other users' fiscal year
  @ApiOperation({ summary: 'Update user active fiscal year by ID' })
  @ApiResponse({ status: 200, description: 'Fiscal year updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  updateUserFiscalYear(@Param('id') id: string, @Body() updateFiscalYearDto: UpdateFiscalYearDto) {
    return this.usersService.updateActiveFiscalYear(id, updateFiscalYearDto.fiscalYearId);
  }
}