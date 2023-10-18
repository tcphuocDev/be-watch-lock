import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  fullname: string;

  @Column()
  gender: number;

  @Column()
  password: string;

  @Column()
  role: number;

  @Column()
  isActive: number;

  @Column()
  otp: string;

  @Column()
  otpExpired: Date;

  @Column()
  countCheckOtp: number;

  @Column()
  countOtp: number;

  @Column()
  otpLogin: string;

  @Column()
  otpLoginExpired: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  hashPassword() {
    if (this.password) {
      const salt = bcrypt.genSaltSync(10);
      this.password = bcrypt.hashSync(this.password, salt);
    }
  }

  comparePassword(enteredPassword: string) {
    return bcrypt.compareSync(enteredPassword, this.password);
  }

  compareOTPLogin(otp: string) {
    return otp === this.otpLogin;
  }

  getRefreshToken = function () {
    return jwt.sign({ id: this.id }, 'abcbacb', {
      expiresIn: 10000000,
    });
  };
}
