import { Module } from '@nestjs/common';
import { SvmController } from '@modules/swm/controllers';
import { SvmService } from '@modules/swm/services';
import { PrismaSharedModule } from '@modules/db/prisma-shared.module';

@Module({
  imports: [PrismaSharedModule],
  controllers: [SvmController],
  providers: [SvmService],
})
export class SvmModule {
}
