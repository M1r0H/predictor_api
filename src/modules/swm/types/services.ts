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
  options: {
    type: string;
    kernel: string;
    gamma: number;
    cost: number;
  };
  model: number;
  problem: number;

  train(data: number[][], labels: number[]): Promise<void>;

  serializeModel(): string;

  getSVIndices(): number[];
}

export interface TrainSVMParams {
  inputData: number[][];
  labels: number[];
  normalizationMethod: 'zscore' | 'minmax' | 'range' | 'vector';
}

