import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';

type UploadConstraints = {
  allowedMimeTypes: readonly string[];
  maxSizeBytes: number;
  isPublic: boolean;
  pathPrefix: string;
};

type UploadInput = {
  buffer: Buffer;
  mimetype: string;
  size: number;
  originalname: string;
};

type UploadResult = {
  url: string;
  key: string;
  bucket: string;
};

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly region: string;
  private readonly endpoint?: string;
  private readonly publicUrl?: string;

  constructor(private readonly configService: ConfigService) {
    this.bucket = this.getRequired('s3.bucket');
    this.region = this.getRequired('s3.region');
    this.endpoint = this.configService.get<string>('s3.endpoint') || undefined;
    this.publicUrl =
      this.configService.get<string>('s3.publicUrl') || undefined;

    this.client = new S3Client({
      region: this.region,
      endpoint: this.endpoint,
      forcePathStyle: Boolean(this.endpoint),
      credentials: {
        accessKeyId: this.getRequired('s3.accessKey'),
        secretAccessKey: this.getRequired('s3.secretKey'),
      },
    });
  }

  async upload(
    input: UploadInput,
    constraints: UploadConstraints,
  ): Promise<UploadResult> {
    this.ensureFile(input, constraints);

    const key = this.buildKey(constraints.pathPrefix, input.originalname);

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: input.buffer,
        ContentType: input.mimetype,
        ACL: constraints.isPublic ? 'public-read' : undefined,
      }),
    );

    return {
      key,
      bucket: this.bucket,
      url: this.buildPublicUrl(key, constraints.isPublic),
    };
  }

  async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
    if (!key) {
      throw new BadRequestException('Не задан ключ файла');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    return getS3SignedUrl(this.client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  isOwnPublicUrl(url: string): boolean {
    if (!url) {
      return false;
    }

    if (this.publicUrl && url.startsWith(this.publicUrl.replace(/\/$/, ''))) {
      return true;
    }

    if (this.endpoint) {
      const base = `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/`;
      return url.startsWith(base);
    }

    return url.includes(`${this.bucket}.s3.${this.region}.amazonaws.com`);
  }

  private ensureFile(input: UploadInput, constraints: UploadConstraints) {
    if (!input?.buffer) {
      throw new BadRequestException('Файл не передан');
    }
    if (!constraints.allowedMimeTypes.includes(input.mimetype)) {
      throw new BadRequestException('Недопустимый тип файла');
    }
    if (input.size > constraints.maxSizeBytes) {
      throw new BadRequestException('Размер файла превышает лимит');
    }
  }

  private buildKey(pathPrefix: string, originalName: string): string {
    const safePrefix = pathPrefix.replace(/(^\/|\/$)/g, '');
    const extension = this.getExtension(originalName);
    const name = `${randomUUID()}${extension}`;
    return safePrefix ? `${safePrefix}/${name}` : name;
  }

  private getExtension(originalName: string): string {
    const dotIndex = originalName.lastIndexOf('.');
    if (dotIndex <= 0 || dotIndex === originalName.length - 1) {
      return '';
    }
    return originalName.slice(dotIndex).toLowerCase();
  }

  private buildPublicUrl(key: string, isPublic: boolean): string {
    if (!isPublic) {
      return '';
    }
    if (this.publicUrl) {
      return `${this.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    if (this.endpoint) {
      return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
    }
    return `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private getRequired(path: string): string {
    const value = this.configService.get<string>(path);
    if (!value) {
      throw new Error(`Переменная окружения ${path} обязательна`);
    }
    return value;
  }
}
