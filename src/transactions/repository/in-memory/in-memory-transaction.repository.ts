import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';

import { ITransactionRepository } from '../transaction.repository.interface';
import { Prisma, Transaction } from '../../../../generated/prisma';

@Injectable()
export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [];

  findById(id: string) {
    const transaction = this.transactions.find(
      (transaction) => transaction.id === id,
    );

    if (!transaction) {
      return null;
    }

    return transaction;
  }

  createTransfer(amount: number, receiverId: string, senderId: string) {
    const transaction: Transaction = {
      id: randomUUID(),
      receiver_id: receiverId,
      sender_id: senderId,
      description: null,
      created_at: new Date(),
      updated_at: new Date(),
      reversed: false,
      reversed_transaction_id: null,
      type: 'TRANSFER',
      amount: new Prisma.Decimal(amount.toString()),
    };

    this.transactions.push(transaction);

    return transaction;
  }

  createDeposit(amount: number, senderId: string) {
    const transaction: Transaction = {
      id: randomUUID(),
      receiver_id: senderId,
      sender_id: senderId,
      description: null,
      created_at: new Date(),
      updated_at: new Date(),
      reversed: false,
      reversed_transaction_id: null,
      type: 'DEPOSIT',
      amount: new Prisma.Decimal(amount.toString()),
    };

    this.transactions.push(transaction);

    return transaction;
  }

  revert(transaction: Transaction) {
    const transactionReversal: Transaction = {
      id: randomUUID(),
      receiver_id: transaction.receiver_id,
      sender_id: transaction.sender_id,
      description: null,
      created_at: new Date(),
      updated_at: new Date(),
      reversed: false,
      reversed_transaction_id: transaction.id,
      type: 'REVERSAL',
      amount: new Prisma.Decimal(transaction.amount.toString()),
    };

    this.transactions.push(transaction);

    const transactionAtStorage = this.transactions.findIndex(
      (t) => t.id === transaction.id,
    );

    if (transactionAtStorage >= 0) {
      this.transactions[transactionAtStorage].reversed = true;
    }

    return transactionReversal;
  }
}
