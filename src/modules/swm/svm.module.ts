import {Module} from "@nestjs/common";
import {SvmController} from "@modules/swm/controllers";
import {SvmService} from "@modules/swm/services";

@Module({
  imports: [],
  controllers: [SvmController],
  providers: [SvmService],
})
export class SvmModule {}
