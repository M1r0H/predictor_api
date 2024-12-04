import { Injectable } from '@nestjs/common';
import * as libsvm from 'libsvm-js';
import { SVM, SVMModel, TrainSVMReturnType } from '@modules/swm/types';

@Injectable()
export class SvmService {
  private svmModel: SVMModel = null;
  private SVM: SVM = null;

  /**
   * Train an SVM model using the provided data and labels.
   * @return {Object} Training results.
   */
  public async trainSVM(): Promise<TrainSVMReturnType> {
    await this.loadSvmLibrary();

    const data = [
      [1.54, 1.76],
      [2.20, 1.69],
      [1.66, 1.28],
      [1.88, 1.71],
    ];
    const labels = [-1, 1, -1, 1];

    this.svmModel = new this.SVM({
      type: this.SVM.SVM_TYPES.C_SVC,
      kernel: this.SVM.KERNEL_TYPES.RBF,
      gamma: 0.5,
      cost: 1.0,
    });

    await this.svmModel.train(data, labels);

    return {
      message: 'Model trained successfully!',
      supportVectors: this.svmModel.getSVIndices(),
      data,
      labels,
    };
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
