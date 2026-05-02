import { IsArray, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateEpochDto {
  @IsString()
  @MinLength(1)
  modelId!: string;

  @IsString()
  version!: string;

  @IsOptional()
  @IsString()
  parentEpochId?: string | null;

  @IsString()
  datasetVersion!: string;

  @IsString()
  weightsHash!: string;

  @IsString()
  configHash!: string;

  @IsArray()
  metrics!: { name: string; value: number; unit?: string }[];

  @IsOptional()
  @IsIn(['base', 'base-sepolia'])
  network?: 'base' | 'base-sepolia';
}
