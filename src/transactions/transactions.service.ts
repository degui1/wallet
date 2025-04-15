import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    { amount, receiverId }: CreateTransactionDto,
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
        },
      });
    });
  }
}
