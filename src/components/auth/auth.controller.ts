import { Public } from '@decorators/public.decorator';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordRequest } from './dto/request/fotgot-password.request';
import { GetTokenRequest } from './dto/request/get-token.request';
import { ResetPasswordRequest } from './dto/request/reset-password.request';
import { SetupPasswordRequest } from './dto/request/setup-password.request';
import { UpdatePasswordRequest } from './dto/request/update-password.request';
import { UpdateUserRequest } from './dto/request/update-user.request';
import { UserLoginRequest } from './dto/request/user-login.request';
import { UserRegisterRequest } from './dto/request/user-register.request';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  public async register(@Body() request: UserRegisterRequest): Promise<any> {
    return this.authService.register(request);
  }

  @Public()
  @Post('login')
  async login(@Body() request: UserLoginRequest) {
    return this.authService.login(request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() request: any) {
    return this.authService.getProfile(request);
  }

  @Public()
  @Post('token')
  getToken(@Body() request: GetTokenRequest) {
    return this.authService.getToken(request);
  }

  @Public()
  @Post('forgot-password')
  forgotPassword(@Body() request: ForgotPasswordRequest) {
    return this.authService.forgotPassword(request);
  }

  @Public()
  @Post('send-otp')
  sendOTP(@Body() request: ForgotPasswordRequest) {
    return this.authService.sendOTP(request);
  }

  @Put('update')
  update(@Body() request: UpdateUserRequest, @Request() req: any) {
    return this.authService.update(request, req.user);
  }

  @Put('update-password')
  updatePassword(@Body() request: UpdatePasswordRequest, @Request() req: any) {
    return this.authService.updatePassword(request, req.user);
  }

  @Put('setup-password')
  setupPassword(@Body() request: SetupPasswordRequest, @Request() req: any) {
    return this.authService.setupPassword(request, req.user);
  }

  @Public()
  @Put('reset-password')
  resetPassword(@Body() request: ResetPasswordRequest) {
    return this.authService.resetPassword(request);
  }
}
