import { Controller, Post, Body, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { Request } from 'express';
import { DepositTransactionDto } from './dto/deposit-transaction.dto';
import { RevertTransactionDto } from './dto/revert-transaction.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Make a transfer' })
  @ApiResponse({ status: 201, description: 'Returns a transfer object' })
  async transfer(
    @Body() transferTransactionDto: TransferTransactionDto,
    @Req() request: Request,
  ) {
    const { transaction } = await this.transactionsService.transfer(
      transferTransactionDto,
      request.user.sub,
    );

    return {
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.created_at,
        type: transaction.type,
      },
    };
  }

  @Post('/deposit')
  @ApiOperation({ summary: 'Make a deposit' })
  @ApiResponse({ status: 201, description: 'Returns a deposit object' })
  async deposit(
    @Body() depositTransactionDto: DepositTransactionDto,
    @Req() request: Request,
  ) {
    const { transaction } = await this.transactionsService.deposit(
      depositTransactionDto,
      request.user.sub,
    );

    return {
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.created_at,
        type: transaction.type,
      },
    };
  }

  @Post('/revert')
  @ApiOperation({ summary: 'Revert a transfer' })
  @ApiResponse({ status: 201, description: 'Returns a reverted transfer' })
  async revert(
    @Body() revertTransactionDto: RevertTransactionDto,
    @Req() request: Request,
  ) {
    const { transaction } = await this.transactionsService.revert(
      revertTransactionDto,
      request.user.sub,
    );

    return {
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        description: transaction.description,
        createdAt: transaction.created_at,
        type: transaction.type,
      },
    };
  }
}
