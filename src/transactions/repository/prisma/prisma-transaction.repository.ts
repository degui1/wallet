import { Transaction } from '../../../../generated/prisma';
import { PrismaService } from '../../../prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { ITransactionRepository } from '../transaction.repository.interface';

@Injectable()
export class PrismaTransactionRepository implements ITransactionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
    });

    return transaction;
  }

  async createTransfer(amount: number, receiverId: string, senderId: string) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: senderId },
        data: {
          balance: { decrement: amount },
          updated_at: new Date(),
        },
      });

      await tx.user.update({
        where: { id: receiverId },
        data: {
          balance: { increment: amount },
          updated_at: new Date(),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          sender_id: senderId,
          receiver_id: receiverId,
          amount: amount,
          type: 'TRANSFER',
        },
      });

      return transaction;
    });
  }

  async createDeposit(amount: number, senderId: string) {
    return await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: senderId },
        data: {
          balance: { increment: amount },
          updated_at: new Date(),
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          sender_id: senderId,
          receiver_id: senderId,
          amount: amount,
          type: 'DEPOSIT',
        },
      });

      return transaction;
    });
  }

  async revert(transaction: Transaction) {
    return await this.prisma.$transaction(async (tx) => {
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

      const transactionReversal = await tx.transaction.create({
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

      return transactionReversal;
    });
  }
}
