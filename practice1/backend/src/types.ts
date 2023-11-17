export type Color = {
  color: string;
  colorCode: number[];
};

export type CreateColorInput = {
  color: string;
  colorCode: number[];
};

export type CreateColorVariables = {
  input: CreateColorInput;
};

export enum ColorMutationType {
  CREATED = "CREATED",
  UPDATED = "UPDATED",
  DELETED = "DELETED",
}

