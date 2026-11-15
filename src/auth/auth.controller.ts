// src/auth/auth.controller.ts
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Patch,
  Post,
  Req,
  UseGuards,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  Toggle2FaDto,
  Verify2FaDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from './roles.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async login(@Body() body: LoginDto, @Ip() ipAddress: string) {
    return this.authService.login(body.email, body.password, ipAddress);
  }

  @Post('verify-2fa')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async verify2Fa(@Body() body: Verify2FaDto, @Ip() ipAddress: string) {
    return this.authService.verify2Fa(body.email, body.otp, ipAddress);
  }

  @Post('forgot-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async resetPassword(
    @Body() body: ResetPasswordDto,
    @Ip() ipAddress: string,
  ) {
    return this.authService.resetPassword(
      body.token,
      body.newPassword,
      ipAddress,
    );
  }

  @Patch('toggle-2fa')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async toggle2FA(
    @Body() body: Toggle2FaDto,
    @Req() req: { user: { userId: string } },
  ) {
    return this.authService.toggle2FA(req.user.userId, body.enable);
  }

  @Get('audit-logs')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getAuditLogs(@Req() req: { user: { orgId: string } }) {
    return this.authService.findAuditLogs(req.user.orgId);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async register(@Body() body: RegisterDto) {
    // Передаємо captchaToken у сервіс
    return this.authService.register(body.email, body.password, body.orgCode, body.captchaToken);
  }
}