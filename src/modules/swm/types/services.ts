export interface SVM {
  SVM_TYPES: {
    C_SVC: string;
  };
  KERNEL_TYPES: {
    RBF: string;
  };

  new(options: { type: string; kernel: string; gamma: number; cost: number }): SVMModel;
}

export interface SVMModel {
  train(data: number[][], labels: number[]): Promise<void>;

  getSVIndices(): number[];

  predict(inputSamples: number[][]): number[];

  serializeModel(): string;

  load(modelState: never): void;
}

export interface TrainSVMReturnType {
  message: string;
  supportVectors: number[];
  data: number[][];
  labels: number[];
}
