import {
  CACHE_MANAGER,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRepository } from '@repositories/user.repository';
import { ResponseBuilder } from '@utils/response-builder';
import { UserRegisterRequest } from './dto/request/user-register.request';
import { JwtService } from '@nestjs/jwt';
import { UserLoginRequest } from './dto/request/user-login.request';
import { Cache } from 'cache-manager';
import { GetTokenRequest } from './dto/request/get-token.request';
import * as jwt from 'jsonwebtoken';
import { ResponseCodeEnum } from '@enums/response-code.enum';
import { ResponseMessageEnum } from '@enums/response-message.enum';
import { plainToClass } from 'class-transformer';
import { GetProfileResponse } from './dto/response/get-profile.response';
import { ForgotPasswordRequest } from './dto/request/fotgot-password.request';
import { sendSMS } from '@utils/send-sms';
import { UserStatusEnum } from '@components/user/user.constant';
import { ApiError } from '@utils/api.error';
import * as moment from 'moment-timezone';
import { AddressRepository } from '@repositories/address.repository';
import { UpdateUserRequest } from './dto/request/update-user.request';
import { UserRequest } from '@utils/user.request';
import { UpdatePasswordRequest } from './dto/request/update-password.request';
import { SetupPasswordRequest } from './dto/request/setup-password.request';
import { ResetPasswordRequest } from './dto/request/reset-password.request';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,

    @InjectRepository(AddressRepository)
    private readonly addressRepository: AddressRepository,

    private jwtService: JwtService,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  async register(request: UserRegisterRequest): Promise<any> {
    const userPhone = await this.userRepository.findOne({
      where: {
        phone: request.phone,
      },
    });

    if (userPhone) {
      return new ApiError(
        ResponseCodeEnum.BAD_GATEWAY,
        ResponseMessageEnum.PHONE_EXISTS,
      ).toResponse();
    }

    const userEmail = await this.userRepository.findOne({
      where: {
        email: request.email,
      },
    });

    if (userEmail) {
      return new ApiError(
        ResponseCodeEnum.BAD_GATEWAY,
        ResponseMessageEnum.EMAIL_EXISTS,
      ).toResponse();
    }

    const userEntity = this.userRepository.createEntity(request);
    const user = await this.userRepository.save(userEntity);

    const token = this.jwtService.sign({ id: user.id });
    const refreshToken = user.getRefreshToken();

    await this.cacheManager.set(user.id.toString(), refreshToken, {
      ttl: 10000000,
    });

    return new ResponseBuilder({ token, refreshToken })
      .withCode(ResponseCodeEnum.CREATED)
      .build();
  }

  async login(request: UserLoginRequest) {
    const user = await this.userRepository.findOne({
      where: {
        phone: request.phone,
      },
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    if (request.password) {
      const isMatch = user.comparePassword(request.password);

      if (!isMatch) {
        return new ResponseBuilder()
          .withMessage(ResponseMessageEnum.INVALID_PASSWORD)
          .withCode(ResponseCodeEnum.NOT_FOUND)
          .build();
      }
    }

    if (request.otp) {
      if (user.countOtp === 5) {
        return new ApiError(
          ResponseCodeEnum.BAD_REQUEST,
          ResponseMessageEnum.INVALID_OTP,
        ).toResponse();
      }

      const isMatchOTP = user.compareOTPLogin(request.otp);

      if (!isMatchOTP) {
        user.countOtp = user.countOtp + 1;
        await this.userRepository.save(user);
        return new ResponseBuilder()
          .withMessage(ResponseMessageEnum.INVALID_OTP)
          .withCode(ResponseCodeEnum.NOT_FOUND)
          .build();
      }

      if (moment(user.otpLoginExpired).isBefore(moment())) {
        return new ResponseBuilder()
          .withMessage(ResponseMessageEnum.OTP_EXPIRED)
          .withCode(ResponseCodeEnum.NOT_FOUND)
          .build();
      }

      user.otpLogin = null;
      user.otpLoginExpired = null;
      await this.userRepository.save(user);
    }

    if (!request.password && !request.otp) {
      return new ApiError(
        ResponseCodeEnum.UNAUTHORIZED,
        ResponseMessageEnum.UNAUTHORIZED,
      ).toResponse();
    }

    const token = this.jwtService.sign({ id: user.id });
    const refreshToken = user.getRefreshToken();
    await this.cacheManager.set(user.id.toString(), refreshToken, {
      ttl: 10000000,
    });

    return new ResponseBuilder({ token, refreshToken })
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async getToken(request: GetTokenRequest) {
    try {
      const verify: any = jwt.verify(request.refreshToken, 'abcbacb');

      const check = await this.cacheManager.get(verify?.id);

      if (!check) {
        return new ResponseBuilder()
          .withMessage(ResponseMessageEnum.INVALID_REFRESH_TOKEN)
          .withCode(ResponseCodeEnum.BAD_REQUEST)
          .build();
      }

      const token = this.jwtService.sign({ id: verify?.id });

      return new ResponseBuilder({ token })
        .withMessage(ResponseMessageEnum.SUCCESS)
        .withCode(ResponseCodeEnum.SUCCESS)
        .build();
    } catch (error) {
      return new ResponseBuilder()
        .withMessage(ResponseMessageEnum.INVALID_REFRESH_TOKEN)
        .withCode(ResponseCodeEnum.SERVER_ERROR)
        .build();
    }
  }

  async getProfile(request: any) {
    const dataReturn = plainToClass(GetProfileResponse, request.user, {
      excludeExtraneousValues: true,
    });

    const user = await this.userRepository.findOne(dataReturn.id);

    if (user.password) {
      dataReturn.isPassword = true;
    } else {
      dataReturn.isPassword = false;
    }

    dataReturn.addresses = await this.addressRepository.find({
      userId: dataReturn.id,
    });

    return new ResponseBuilder(dataReturn)
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async validateUser(id: number): Promise<any> {
    const user = await this.userRepository.findOne(id);
    if (user) {
      return user;
    }
    return null;
  }

  async forgotPassword(request: ForgotPasswordRequest) {
    const user = await this.userRepository.findOne({
      where: {
        phone: request.phone,
      },
    });

    if (!user) {
      return new ResponseBuilder()
        .withMessage(ResponseMessageEnum.PHONE_NOT_FOUND)
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .build();
    }

    const otpCode = Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
    const otpCodeExpired = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = otpCode.toString();
    user.otpExpired = otpCodeExpired;
    user.countCheckOtp = 0;

    await this.userRepository.save(user);

    await sendSMS(
      user.phone,
      `Mã OTP để khôi phục mật khẩu là: ${otpCode.toString()}`,
    );

    return new ResponseBuilder()
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async sendOTP(request: ForgotPasswordRequest) {
    const user = await this.userRepository.findOne({
      where: {
        phone: request.phone,
      },
    });

    if (!user) {
      return new ResponseBuilder()
        .withMessage(ResponseMessageEnum.PHONE_NOT_FOUND)
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .build();
    }
    if (user.isActive === UserStatusEnum.DeActive) {
      return new ApiError(
        ResponseCodeEnum.UNAUTHORIZED,
        ResponseMessageEnum.USER_BLOCKED,
      ).toResponse();
    }

    const otpCode = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
    const otpCodeExpired = new Date(Date.now() + 10 * 60 * 1000);

    user.otpLogin = otpCode.toString();
    user.otpLoginExpired = otpCodeExpired;
    user.countOtp = 0;

    await this.userRepository.save(user);

    await sendSMS(
      user.phone,
      `${otpCode.toString()} là mã xác nhận để đăng nhập tại website, có hiệu lực đến ${moment(
        otpCodeExpired,
      )
        .tz('Asia/Ho_Chi_Minh')
        .format('HH:mm DD/MM')}`,
    );

    return new ResponseBuilder()
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async update(request: UpdateUserRequest, user: UserRequest) {
    const currentUser = await this.userRepository.findOne(user.id);
    currentUser.fullname = request.fullname;
    currentUser.gender = request.gender;
    await this.userRepository.save(currentUser);
    return new ResponseBuilder()
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async updatePassword(request: UpdatePasswordRequest, user: UserRequest) {
    const currentUser = await this.userRepository.findOne(user.id);

    const isMatch = currentUser.comparePassword(request.oldPassword);

    if (!isMatch) {
      return new ResponseBuilder()
        .withMessage(ResponseMessageEnum.INVALID_PASSWORD)
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .build();
    }

    const salt = bcrypt.genSaltSync(10);
    currentUser.password = bcrypt.hashSync(request.newPassword, salt);
    await this.userRepository.save(currentUser);
    return new ResponseBuilder()
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async setupPassword(request: SetupPasswordRequest, user: UserRequest) {
    const currentUser = await this.userRepository.findOne(user.id);

    if (currentUser.password) {
      return new ResponseBuilder()
        .withMessage(ResponseMessageEnum.CANNOT_SETUP_PASSWORD)
        .withCode(ResponseCodeEnum.NOT_FOUND)
        .build();
    }

    const salt = bcrypt.genSaltSync(10);
    currentUser.password = bcrypt.hashSync(request.password, salt);
    await this.userRepository.save(currentUser);
    return new ResponseBuilder()
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }

  async resetPassword(request: ResetPasswordRequest) {
    const currentUser = await this.userRepository.findOne({
      otp: request.otp,
    });

    let status = true;

    if (!currentUser) {
      status = false;
    }

    if (moment(currentUser.otpExpired).isBefore(moment())) {
      status = false;
    }

    if (currentUser.countCheckOtp >= 5) {
      status = false;
    }

    if (!status) {
      currentUser.countCheckOtp = currentUser.countCheckOtp + 1;
      await this.userRepository.save(currentUser);
      return new ApiError(
        ResponseCodeEnum.BAD_REQUEST,
        ResponseMessageEnum.INVALID_OTP,
      ).toResponse();
    }

    const salt = bcrypt.genSaltSync(10);
    currentUser.password = bcrypt.hashSync(request.password, salt);
    currentUser.otp = null;
    currentUser.otpExpired = null;
    await this.userRepository.save(currentUser);
    return new ResponseBuilder({ status })
      .withMessage(ResponseMessageEnum.SUCCESS)
      .withCode(ResponseCodeEnum.SUCCESS)
      .build();
  }
}
