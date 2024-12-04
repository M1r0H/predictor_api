import { Module } from '@nestjs/common';
import { SvmModule } from "@modules/swm/svm.module";
import { ConfigModule } from "@nestjs/config";
import { CatchEverythingFilter } from "@src/core/filters";
import { PrismaModule } from '@modules/db/prisma.module';

@Module({
  imports: [
    // Core Module
    PrismaModule,
    ConfigModule.forRoot(),

    // Feature Modules
    SvmModule,
  ],
  providers: [
    {
      provide: 'APP_FILTER',
      useClass: CatchEverythingFilter,
    }
  ],
})
export class AppModule {
}
