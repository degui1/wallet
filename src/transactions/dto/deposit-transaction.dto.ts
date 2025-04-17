import { ApiProperty } from '@nestjs/swagger';

export class DepositTransactionDto {
  @ApiProperty({ example: 5000 })
  amount: number;
}
