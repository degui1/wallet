import { Transaction } from 'generated/prisma';

export interface ITransactionRepository {
  findById(id: string): Promise<Transaction | null> | Transaction | null;
  createTransfer(
    amount: number,
    receiverId: string,
    senderId: string,
  ): Promise<Transaction> | Transaction;
  createDeposit(
    amount: number,
    senderId: string,
  ): Promise<Transaction> | Transaction;
  revert(transaction: Transaction): Promise<Transaction> | Transaction;
}
