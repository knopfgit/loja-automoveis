import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import {
  ClientInfo,
  ClientInfoParam,
} from '../../common/decorators/client-info.decorator';
import {
  AuthUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResetPasswordDto,
} from './dto/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Cadastro público de cliente (CUSTOMER)' })
  register(@Body() dto: RegisterDto, @ClientInfoParam() client: ClientInfo) {
    return this.authService.register(dto, client);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Autenticação (retorna access + refresh token)' })
  login(@Body() dto: LoginDto, @ClientInfoParam() client: ClientInfo) {
    return this.authService.login(dto, client);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Renovar tokens usando o refresh token (rotação)' })
  refresh(@Body() dto: RefreshTokenDto, @ClientInfoParam() client: ClientInfo) {
    return this.authService.refresh(dto.refreshToken, client);
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar o refresh token atual' })
  logout(@Body() dto: RefreshTokenDto) {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revogar todas as sessões do usuário' })
  logoutAll(@CurrentUser() user: AuthUser) {
    return this.authService.logoutAll(user.userId);
  }

  @Public()
  @Post('forgot-password')
  @ApiOperation({ summary: 'Solicitar redefinição de senha (envia token)' })
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Post('reset-password')
  @ApiOperation({ summary: 'Redefinir senha com token' })
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Post('change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Alterar a própria senha' })
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.userId, dto);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  me(@CurrentUser() user: AuthUser) {
    return this.authService.me(user.userId);
  }
}
