import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { RangeDateQuery } from './dto/query/range-date.query';

@Controller('dashboard')
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('/summary')
  summary() {
    return this.dashboardService.list();
  }

  @Get('/order-money')
  dashboardMoney(@Query() request: RangeDateQuery) {
    return this.dashboardService.dashboardMoney(request);
  }

  @Get('/customer')
  customer() {
    return this.dashboardService.customer();
  }
}
