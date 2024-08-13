import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/service/user.service';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

const mockUserService = {
  findOneByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn(),
};

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: mockUserService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return an access token for valid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
      };

      mockUserService.findOneByEmail.mockResolvedValue(user);
      mockJwtService.sign.mockReturnValue('accessToken');

      const result = await authService.login(loginDto);

      expect(result).toEqual({ accessToken: 'accessToken' });
      expect(mockUserService.findOneByEmail).toHaveBeenCalledWith(
        'test@example.com',
      );
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        email: user.email,
        id: user.id,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = { email: 'test@example.com', password: 'wrongpassword' };
      const user = {
        id: 1,
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
      };

      mockUserService.findOneByEmail.mockResolvedValue(user);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user is not found', async () => {
      const loginDto = { email: 'test@example.com', password: 'password' };

      mockUserService.findOneByEmail.mockResolvedValue(null);

      await expect(authService.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
