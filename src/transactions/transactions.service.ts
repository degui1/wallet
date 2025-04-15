import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { DepositTransactionDto } from './dto/deposit-transaction.dto';
import { RevertTransactionDto } from './dto/revert-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    { amount, receiverId }: TransferTransactionDto,
    loggedUserId: string,
  ) {
    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new BadRequestException();
    }

    const sender = await this.prisma.user.findUnique({
      where: { id: loggedUserId },
    });

    if (!sender) {
      throw new BadRequestException();
    }

    const hasEnoughFunds = sender.balance.toNumber() >= amount;

    if (!hasEnoughFunds) {
      throw new ForbiddenException('Insufficient funds');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: sender.id },
        data: {
          balance: { decrement: amount },
          updated_at: new Date(),
        },
      });

      await tx.user.update({
        where: { id: receiver.id },
        data: {
          balance: { increment: amount },
          updated_at: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          sender_id: sender.id,
          receiver_id: receiver.id,
          amount: amount,
          type: 'TRANSFER',
        },
      });
    });
  }

  async deposit({ amount }: DepositTransactionDto, loggedUserId: string) {
    const sender = await this.prisma.user.findUnique({
      where: { id: loggedUserId },
    });

    if (!sender) {
      throw new BadRequestException();
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: sender.id },
        data: {
          balance: { increment: amount },
          updated_at: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          sender_id: sender.id,
          receiver_id: sender.id,
          amount: amount,
          type: 'DEPOSIT',
        },
      });
    });
  }

  async revert({ transactionId }: RevertTransactionDto, loggedUserId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new BadRequestException('Transaction not found.');
    }

    const isLoggedUserInvolved =
      transaction.sender_id === loggedUserId ||
      transaction.receiver_id === loggedUserId;

    if (!isLoggedUserInvolved) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    if (transaction.reversed) {
      throw new BadRequestException('Transaction already reversed.');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: transaction.sender_id },
        data: {
          balance: { increment: transaction.amount },
          updated_at: new Date(),
        },
      });

      await tx.user.update({
        where: { id: transaction.receiver_id },
        data: {
          balance: { decrement: transaction.amount },
          updated_at: new Date(),
        },
      });

      await tx.transaction.create({
        data: {
          sender_id: transaction.sender_id,
          receiver_id: transaction.receiver_id,
          amount: transaction.amount,
          type: 'REVERSAL',
          reversed_transaction_id: transaction.id,
        },
      });

      await tx.transaction.update({
        where: { id: transaction.id },
        data: { reversed: true },
      });
    });
  }
}
