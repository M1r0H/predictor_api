import { Controller, Get } from '@nestjs/common';
import { SvmService } from '@modules/swm/services';
import { Model } from '@modules/swm/types';

@Controller('svm')
export class SvmController {
  public constructor(private readonly svmService: SvmService) {
  }

  @Get('train')
  public train(): Promise<Model> {
    return this.svmService.trainSVM();
  }

  // @Post('predict')
  // public predict(@Body('samples') samples: number[][]) {
  //   return this.svmService.predictSVM(samples);
  // }
  //
  // @Get('support-vectors')
  // public getSupportVectors() {
  //   return this.svmService.getSupportVectors();
  // }
  //
  // @Get('serialize')
  // public serializeModel() {
  //   return this.svmService.serializeModel();
  // }

  // @Get('load')
  // public loadModel(@Body('serializedModel') serializedModel: string) {
  //   return this.svmService.loadModel(serializedModel);
  // }
}
