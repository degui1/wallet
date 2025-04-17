import { ApiProperty } from '@nestjs/swagger';

export class TransferTransactionDto {
  @ApiProperty({ example: 'uuid' })
  receiverId: string;

  @ApiProperty({ example: 2000 })
  amount: number;
}
