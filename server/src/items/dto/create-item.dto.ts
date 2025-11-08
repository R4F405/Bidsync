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

  @IsArray()
  @IsOptional()
  @IsUrl(
    {},
    { each: true, message: 'Each image must be a valid URL string' },
  )
  images?: string[];
}