import {Controller, Patch, Param, UseGuards, Request, HttpCode, HttpStatus} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  /**
   * Endpoint para que el COMPRADOR marque la transacción como pagada (inicia el Escrow).
   */
  @Patch(':id/pay')
  @HttpCode(HttpStatus.OK)
  async payForTransaction(@Param('id') transactionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.transactionsService.payForTransaction(transactionId, userId);
  }

  /**
   * Endpoint para que el VENDEDOR marque el artículo como enviado.
   */
  @Patch(':id/ship')
  @HttpCode(HttpStatus.OK)
  async shipItem(@Param('id') transactionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.transactionsService.shipItem(transactionId, userId);
  }

  /**
   * Endpoint para que el COMPRADOR confirme la recepción (completa el Escrow).
   */
  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  async confirmReceipt(@Param('id') transactionId: string, @Request() req) {
    const userId = req.user.userId;
    return this.transactionsService.confirmReceipt(transactionId, userId);
  }
}