import { Controller, Post, Body, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { Request } from 'express';
import { DepositTransactionDto } from './dto/deposit-transaction.dto';
import { RevertTransactionDto } from './dto/revert-transaction.dto';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  transfer(
    @Body() transferTransactionDto: TransferTransactionDto,
    @Req() request: Request,
  ) {
    return this.transactionsService.create(
      transferTransactionDto,
      request.user.sub,
    );
  }

  @Post('/deposit')
  deposit(
    @Body() depositTransactionDto: DepositTransactionDto,
    @Req() request: Request,
  ) {
    return this.transactionsService.deposit(
      depositTransactionDto,
      request.user.sub,
    );
  }

  @Post('/revert')
  revert(
    @Body() revertTransactionDto: RevertTransactionDto,
    @Req() request: Request,
  ) {
    return this.transactionsService.revert(
      revertTransactionDto,
      request.user.sub,
    );
  }
}
