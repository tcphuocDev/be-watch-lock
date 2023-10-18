import { Public } from '@decorators/public.decorator';
import { Controller, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Post()
  ping(): string {
    return this.appService.getHello();
  }
}
