import { ApiProperty } from '@nestjs/swagger';

export class RevertTransactionDto {
  @ApiProperty({ example: 'uuid' })
  transactionId: string;
}
