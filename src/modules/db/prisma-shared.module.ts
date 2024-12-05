import { Module } from '@nestjs/common';
import { PrismaService } from '@modules/db/services';

@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaSharedModule {
}
