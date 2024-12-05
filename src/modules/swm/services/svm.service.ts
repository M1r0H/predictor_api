import { Injectable } from '@nestjs/common';
import * as libsvm from 'libsvm-js';
import { SVM, SVMModel, TrainSVMParams } from '@modules/swm/types';
import { PrismaService } from '@modules/db/services';
import { Model } from '@modules/swm/types/entities';
import { chain, map, reduce } from 'lodash';

@Injectable()
export class SvmService {
  private svmModel: SVMModel = null;
  private SVM: SVM = null;

  public constructor(
    private readonly prisma: PrismaService
  ) {
    void this.loadSvmLibrary();
  }

  /**
   * Train an SVM model using the provided data.
   * @param {Object} _params - Training parameters.
   */
  public async trainSVM(_params?: TrainSVMParams): Promise<Model> {
    // const {
    //   inputData,
    //   labels,
    //   normalizationMethod,
    // } = params;
    try {
      const inputData = [
        [1.54, 1.76],
        [2.20, 1.69],
        [1.66, 1.28],
        [1.88, 1.71],
      ];
      const labels = [-1, 1, -1, 1];
      const normalizedData = map(
        inputData,
        (row: number[]) => this.normalize(row, 'minmax')
      );

      this.svmModel = new this.SVM({
        type: this.SVM.SVM_TYPES.C_SVC,
        kernel: this.SVM.KERNEL_TYPES.RBF,
        gamma: 0.5,
        cost: 1.0,
      });

      await this.svmModel.train(normalizedData, labels);

      const serializedModel = this.svmModel.serializeModel();

      const model = await this.prisma.model.create({
        data: {
          name: `SVM Model - ${ new Date().toISOString() }`,
          type: 'SVM',
          serializedModel: serializedModel,
          supportVector: JSON.stringify(this.svmModel.getSVIndices()),
          createdBy: 'system',
          trainingData: {
            create: {
              data: normalizedData,
              labels: labels,
            },
          },
        },
      });

      return this.prisma.model.findUnique({
        where: {
          id: model.id,
        },
        include: {
          trainingData: true,
        },
      });
    } catch (error) {
      throw new Error(`Error training SVM model: ${ error.message }`);
    }
  }

  private normalize(data: number[], method: 'zscore' | 'minmax' | 'range' | 'vector' = 'zscore'): number[] {
    switch (method) {
      case 'zscore': {
        const mean = reduce(data, (sum, value) => sum + value, 0) / data.length;
        const std = Math.sqrt(
          chain(data)
            .map((value) => Math.pow(value - mean, 2))
            .reduce((sum, value) => sum + value, 0)
            .value() / data.length
        );

        return map(data, (value) => ( value - mean ) / std);
      }

      case 'minmax': {
        const min = Math.min(...data);
        const max = Math.max(...data);

        return map(data, (value) => ( value - min ) / ( max - min ));
      }

      case 'range': {
        const a = 0;
        const b = 1;
        const min = Math.min(...data);
        const max = Math.max(...data);

        return map(data, (value) => a + ( ( value - min ) * ( b - a ) ) / ( max - min ));
      }

      case 'vector': {
        const length = Math.sqrt(
          chain(data)
            .map((value) => value * value)
            .reduce((sum, value) => sum + value, 0)
            .value()
        );

        return map(data, (value) => value / length);
      }

      default:
        throw new Error(`Unknown normalization method: ${ method }`);
    }
  }

  // /**
  //  * Predict labels using the trained SVM model.
  //  * @param {Object} inputSamples - Input samples to predict.
  //  * @return {Object} Predictions for the input samples.
  //  */
  // public predictSVM(inputSamples: number[][]): { inputSamples: number[][], predictions: number[] } {
  //   if (!this.svmModel) {
  //     throw new Error('Model is not trained. Please train the model first.');
  //   }
  //
  //   const predictions = this.svmModel.predict(inputSamples);
  //
  //   return {
  //     inputSamples,
  //     predictions,
  //   };
  // }

  // /**
  //  * Get support vector indices from the trained model.
  //  * @return {Object} Support vector indices.
  //  */
  // public getSupportVectors(): { supportVectorIndices: number[] } {
  //   if (!this.svmModel) {
  //     throw new Error('Model is not trained. Please train the model first.');
  //   }
  //
  //   const svIndices = this.svmModel.getSVIndices();
  //
  //   return {
  //     supportVectorIndices: svIndices,
  //   };
  // }

  // /**
  //  * Serialize the trained model for saving or reuse.
  //  * @return {string} Serialized model string.
  //  */
  // public serializeModel(): any {
  //   if (!this.svmModel) {
  //     throw new Error('Model is not trained. Please train the model first.');
  //   }
  //
  //   return this.svmModel.serializeModel();
  // }

  // /**
  //  * Deserialize a model from a previously saved state.
  //  * @param serializedModel - Serialized model string.
  //  */
  // public async loadModel(serializedModel: string) {
  //   if (!this.svmModel) {
  //     const loadedLibsvm = await libsvm.load();
  //
  //     this.svmModel = new loadedLibsvm({
  //       type: 'C_SVC',
  //       kernel: 'RBF',
  //       gamma: 0.5,
  //       cost: 1.0,
  //     });
  //   }
  //
  //   // const modelState = JSON.parse(serializedModel);
  //   // this.svmModel.load(modelState);
  //
  //   return { message: 'Model loaded successfully!' };
  // }

  /**
   * Load the libsvm library for training and prediction.
   * @return {Promise<void>}
   */
  private async loadSvmLibrary(): Promise<void> {
    if (!this.SVM) {
      this.SVM = await libsvm.default;
    }
  }
}
