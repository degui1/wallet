import { Test, TestingModule } from '@nestjs/testing';
import { TransactionsService } from './transactions.service';
import { InMemoryUserRepository } from '../users/repositories/in-memory/in-memory-user.repository';
import { InMemoryTransactionRepository } from './repository/in-memory/in-memory-transaction.repository';
import { hash } from 'bcryptjs';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from 'src/users/repositories/user.repository.interface';

describe('TransactionsService', () => {
  let service: TransactionsService;
  let inMemoryUserRepository: IUserRepository;
  let inMemoryTransactionRepository: InMemoryTransactionRepository;

  beforeEach(async () => {
    inMemoryUserRepository = new InMemoryUserRepository();
    inMemoryTransactionRepository = new InMemoryTransactionRepository();

    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<TransactionsService>(TransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should be able to transfer.', async () => {
    const transferAmount = 1000;
    const password_hash = await hash('123456', 6);
    const sender = await inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 2000,
    });

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 0,
    });

    const { transaction } = await service.transfer(
      { amount: transferAmount, receiverId: receiver.id },
      sender.id,
    );

    expect(transaction).toHaveProperty('id');
    expect(transaction.amount.toString()).toBe(transferAmount.toString());
    expect(transaction.receiver_id).toBe(receiver.id);
    expect(transaction.sender_id).toBe(sender.id);
  });

  it('should not be able to transfer without a sender.', async () => {
    const transferAmount = 1000;
    const password_hash = await hash('123456', 6);

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    await expect(() =>
      service.transfer({ amount: transferAmount, receiverId: receiver.id }, ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be able to transfer without a receiver.', async () => {
    const transferAmount = 1000;
    const password_hash = await hash('123456', 6);

    const sender = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    await expect(() =>
      service.transfer({ amount: transferAmount, receiverId: '' }, sender.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should not be able to transfer without funds.', async () => {
    const transferAmount = 3000;
    const password_hash = await hash('123456', 6);

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const sender = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    await expect(() =>
      service.transfer(
        { amount: transferAmount, receiverId: receiver.id },
        sender.id,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should be able to deposit.', async () => {
    const depositAmount = 1000;
    const password_hash = await hash('123456', 6);
    const sender = await inMemoryUserRepository.create({
      name: 'John Doe',
      email: 'johndoe@example.com',
      password_hash,
      balance: 0,
    });

    const { transaction } = await service.deposit(
      { amount: depositAmount },
      sender.id,
    );

    expect(transaction).toHaveProperty('id');
    expect(transaction.amount.toString()).toBe(depositAmount.toString());
    expect(transaction.receiver_id).toBe(sender.id);
    expect(transaction.sender_id).toBe(sender.id);
  });

  it('should not be able to deposit without a sender.', async () => {
    const depositAmount = 1000;

    await expect(() =>
      service.deposit({ amount: depositAmount }, ''),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('should be able to revert a transaction.', async () => {
    const transferAmount = 1000;

    const password_hash = await hash('123456', 6);

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const sender = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const transaction = inMemoryTransactionRepository.createTransfer(
      transferAmount,
      receiver.id,
      sender.id,
    );

    const { transaction: transactionReversal } = await service.revert(
      { transactionId: transaction.id },
      sender.id,
    );

    expect(transactionReversal).toHaveProperty('id');
    expect(transactionReversal.receiver_id).toBe(receiver.id);
    expect(transactionReversal.sender_id).toBe(sender.id);
    expect(transactionReversal.reversed_transaction_id).toBe(transaction.id);
  });

  it('should not be possible to reverse a transaction if the user is not part of it.', async () => {
    const transferAmount = 1000;

    const password_hash = await hash('123456', 6);

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const sender = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const transaction = inMemoryTransactionRepository.createTransfer(
      transferAmount,
      receiver.id,
      sender.id,
    );

    await expect(() =>
      service.revert({ transactionId: transaction.id }, 'id-test'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('should not be possible to reverse a transaction that has already been reversed.', async () => {
    const transferAmount = 1000;

    const password_hash = await hash('123456', 6);

    const receiver = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const sender = await inMemoryUserRepository.create({
      name: 'Receiver',
      email: 'receiver@example.com',
      password_hash,
      balance: 2000,
    });

    const transaction = inMemoryTransactionRepository.createTransfer(
      transferAmount,
      receiver.id,
      sender.id,
    );

    await service.revert({ transactionId: transaction.id }, sender.id);

    await expect(() =>
      service.revert({ transactionId: transaction.id }, sender.id),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
