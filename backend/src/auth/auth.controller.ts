import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";

import { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { UsersService } from "../users/users.service";

@Controller("api/auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post("register")
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post("login")
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true })
    response: Response
  ) {
    const result = await this.authService.login(dto);

    response.cookie("auth_token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return result.user;
  }

  @Post("logout")
  logout(
    @Res({ passthrough: true })
    response: Response
  ) {
    response.clearCookie("auth_token");

    return {
      success: true,
    };
  }

  @Get("me")
  @UseGuards(JwtAuthGuard)
  async me(@Req() request: Request) {
    return this.usersService.findById(request["user"].id);
  }
}
