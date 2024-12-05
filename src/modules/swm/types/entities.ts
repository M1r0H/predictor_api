import { JsonValue } from '@prisma/client/runtime/library';

export type Model = {
  id: string;
  name: string;
  type: string;
  version: string;
  serializedModel: string;
  supportVector: JsonValue;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  trainingData?: TrainingData[];
}

export type TrainingData = {
  id: string;
  data: JsonValue;
  labels: JsonValue;
  modelId: string;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  model?: Model;
}
