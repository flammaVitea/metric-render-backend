import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  Matches,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний формат електронної пошти' })
  email: string;

  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        'Пароль надто слабкий. Він повинен мати мінімум 8 символів, містити великі та малі літери, хоча б одну цифру та спеціальний символ.',
    },
  )
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Код організації є обов’язковим' })
  orgCode: string;

  @IsString()
  @IsNotEmpty({ message: 'Токен CAPTCHA є обов’язковим' })
  captchaToken: string;
}

export class LoginDto {
  @IsEmail({}, { message: 'Некоректний формат електронної пошти' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль є обов’язковим' })
  password: string;
}

export class Verify2FaDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{6}$/)
  otp: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @Matches(/^\d{6}$/, {
    message: 'Код підтвердження має складатись із 6 цифр',
  })
  token: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  })
  newPassword: string;
}

export class Toggle2FaDto {
  @IsBoolean()
  enable: boolean;
}