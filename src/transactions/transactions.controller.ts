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
  async transfer(
    @Body() transferTransactionDto: TransferTransactionDto,
    @Req() request: Request,
  ) {
    await this.transactionsService.transfer(
      transferTransactionDto,
      request.user.sub,
    );
  }

  @Post('/deposit')
  async deposit(
    @Body() depositTransactionDto: DepositTransactionDto,
    @Req() request: Request,
  ) {
    await this.transactionsService.deposit(
      depositTransactionDto,
      request.user.sub,
    );
  }

  @Post('/revert')
  async revert(
    @Body() revertTransactionDto: RevertTransactionDto,
    @Req() request: Request,
  ) {
    await this.transactionsService.revert(
      revertTransactionDto,
      request.user.sub,
    );
  }
}
