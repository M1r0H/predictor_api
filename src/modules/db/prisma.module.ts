import { Module } from '@nestjs/common';
import { PrismaSharedModule } from '@modules/db/prisma-shared.module';

@Module({
  imports: [PrismaSharedModule],
})
export class PrismaModule {
}
