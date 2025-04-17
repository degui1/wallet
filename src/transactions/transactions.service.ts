import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
} from '@nestjs/common';
import { TransferTransactionDto } from './dto/transfer-transaction.dto';
import { DepositTransactionDto } from './dto/deposit-transaction.dto';
import { RevertTransactionDto } from './dto/revert-transaction.dto';
import { IUserRepository } from 'src/users/repositories/user.repository.interface';
import { ITransactionRepository } from './repository/transaction.repository.interface';

@Injectable()
export class TransactionsService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('ITransactionRepository')
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async transfer(
    { amount, receiverId }: TransferTransactionDto,
    loggedUserId: string,
  ) {
    const receiver = await this.userRepository.findById(receiverId);

    if (!receiver) {
      throw new BadRequestException();
    }

    const sender = await this.userRepository.findById(loggedUserId);

    if (!sender) {
      throw new BadRequestException();
    }

    const hasEnoughFunds = sender.balance.toNumber() >= amount;

    if (!hasEnoughFunds) {
      throw new ForbiddenException('Insufficient funds');
    }

    const transaction = await this.transactionRepository.createTransfer(
      amount,
      receiver.id,
      sender.id,
    );

    return {
      transaction,
    };
  }

  async deposit({ amount }: DepositTransactionDto, loggedUserId: string) {
    const sender = await this.userRepository.findById(loggedUserId);

    if (!sender) {
      throw new BadRequestException();
    }

    const transaction = await this.transactionRepository.createDeposit(
      amount,
      loggedUserId,
    );

    return {
      transaction,
    };
  }

  async revert({ transactionId }: RevertTransactionDto, loggedUserId: string) {
    const transaction =
      await this.transactionRepository.findById(transactionId);

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

    if (transaction.type === 'DEPOSIT') {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );
    }

    if (transaction.reversed) {
      throw new BadRequestException('Transaction already reversed.');
    }

    const transactionReveal =
      await this.transactionRepository.revert(transaction);

    return {
      transaction: transactionReveal,
    };
  }
}
