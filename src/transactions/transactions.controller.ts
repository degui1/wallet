import { Controller, Post, Body, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Request } from 'express';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Req() request: Request,
  ) {
    return this.transactionsService.create(
      createTransactionDto,
      request.user.sub,
    );
  }
}
