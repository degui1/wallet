import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { InMemoryTransactionRepository } from './repository/in-memory/in-memory-transaction.repository';
import { InMemoryUserRepository } from '../users/repositories/in-memory/in-memory-user.repository';
import { hash } from 'bcryptjs';
import { Request } from 'express';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let inMemoryUserRepository: InMemoryUserRepository;
  let inMemoryTransactionRepository: InMemoryTransactionRepository;

  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [
        TransactionsService,
        {
          provide: 'IUserRepository',
          useValue: inMemoryUserRepository,
        },
        {
          provide: 'ITransactionRepository',
          useValue: inMemoryTransactionRepository,
        },
      ],
    }).compile();

    controller = module.get<TransactionsController>(TransactionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should be able to make a transfer', async () => {
    const transferAmount = 1000;
    const password_hash = await hash('123456', 6);

    const sender = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const receiver = inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 0,
    });

    const request = { user: { sub: sender.id } } as unknown as Request;

    const { transaction } = await controller.transfer(
      {
        amount: transferAmount,
        receiverId: receiver.id,
      },
      request,
    );

    expect(transaction.id).toEqual(expect.any(String));
    expect(transaction.amount.toString()).toBe(transferAmount.toString());
    expect(transaction.type).toEqual('TRANSFER');
  });

  it('should be able to make a deposit', async () => {
    const depositAmount = 1000;
    const password_hash = await hash('123456', 6);

    const sender = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const request = { user: { sub: sender.id } } as unknown as Request;

    const { transaction } = await controller.deposit(
      {
        amount: depositAmount,
      },
      request,
    );

    expect(transaction.id).toEqual(expect.any(String));
    expect(transaction.amount.toString()).toBe(depositAmount.toString());
    expect(transaction.type).toEqual('DEPOSIT');
  });

  it('should be able to revert a transaction', async () => {
    const password_hash = await hash('123456', 6);

    const sender = inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const receiver = inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 0,
    });

    const transaction = inMemoryTransactionRepository.createTransfer(
      1000,
      receiver.id,
      sender.id,
    );

    const request = { user: { sub: sender.id } } as unknown as Request;

    const { transaction: transactionReversal } = await controller.revert(
      { transactionId: transaction.id },
      request,
    );

    expect(transactionReversal.id).toEqual(expect.any(String));
    expect(transactionReversal.type).toEqual('REVERSAL');
  });
});
