import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsUrl,
  IsOptional,
  MinLength,
} from 'class-validator';

export class CreateItemDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(10)
  description: string;
}