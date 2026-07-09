import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageRetryPolicyType,
  StorageSharedKeyCredential,
  SASProtocol,
  type StoragePipelineOptions,
} from '@azure/storage-blob';
import { DefaultAzureCredential } from '@azure/identity';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { UpstreamError } from '../../lib/errors.js';

/** Exponential retry policy applied to every Blob operation. */
const pipelineOptions: StoragePipelineOptions = {
  retryOptions: {
    retryPolicyType: StorageRetryPolicyType.EXPONENTIAL,
    maxTries: 4,
    retryDelayInMs: 500,
    maxRetryDelayInMs: 8_000,
    tryTimeoutInMs: 60_000,
  },
};

/**
 * Wraps Azure Blob Storage for audio-recording persistence. Uses a connection
 * string when provided, otherwise falls back to managed-identity auth against
 * the account URL.
 */
class BlobService {
  private clientPromise: Promise<BlobServiceClient> | null = null;
  private sharedKey: StorageSharedKeyCredential | null = null;

  private async getClient(): Promise<BlobServiceClient> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        let client: BlobServiceClient;
        if (env.BLOB_CONNECTION_STRING) {
          client = BlobServiceClient.fromConnectionString(
            env.BLOB_CONNECTION_STRING,
            pipelineOptions,
          );
          // Extract shared key so we can mint SAS tokens for downloads.
          const match = /AccountKey=([^;]+)/.exec(env.BLOB_CONNECTION_STRING);
          if (match?.[1]) {
            this.sharedKey = new StorageSharedKeyCredential(env.BLOB_ACCOUNT_NAME, match[1]);
          }
        } else {
          const url = `https://${env.BLOB_ACCOUNT_NAME}.blob.core.windows.net`;
          client = new BlobServiceClient(url, new DefaultAzureCredential(), pipelineOptions);
        }
        const container = client.getContainerClient(env.BLOB_CONTAINER);
        await container.createIfNotExists();
        logger.info({ container: env.BLOB_CONTAINER }, 'Blob container is ready');
        return client;
      })().catch((err) => {
        this.clientPromise = null;
        logger.error({ err }, 'Failed to initialise Blob storage');
        throw new UpstreamError('Blob storage is unavailable');
      });
    }
    return this.clientPromise;
  }

  /** Uploads an audio recording buffer and returns its blob name. */
  async uploadRecording(blobName: string, data: Buffer, contentType: string): Promise<string> {
    const client = await this.getClient();
    const container = client.getContainerClient(env.BLOB_CONTAINER);
    const block = container.getBlockBlobClient(blobName);
    await block.uploadData(data, {
      blobHTTPHeaders: { blobContentType: contentType },
    });
    return blobName;
  }

  /**
   * Returns a time-limited read URL for a recording. With a shared key we mint a
   * SAS token; with managed identity we return a user-delegation SAS.
   */
  async getDownloadUrl(blobName: string, ttlMinutes = 15): Promise<string> {
    const client = await this.getClient();
    const container = client.getContainerClient(env.BLOB_CONTAINER);
    const blob = container.getBlockBlobClient(blobName);
    const startsOn = new Date(Date.now() - 60_000);
    const expiresOn = new Date(Date.now() + ttlMinutes * 60_000);
    const permissions = BlobSASPermissions.parse('r');

    if (this.sharedKey) {
      const sas = generateBlobSASQueryParameters(
        {
          containerName: env.BLOB_CONTAINER,
          blobName,
          permissions,
          startsOn,
          expiresOn,
          protocol: SASProtocol.Https,
        },
        this.sharedKey,
      ).toString();
      return `${blob.url}?${sas}`;
    }

    const userDelegationKey = await client.getUserDelegationKey(startsOn, expiresOn);
    const sas = generateBlobSASQueryParameters(
      {
        containerName: env.BLOB_CONTAINER,
        blobName,
        permissions,
        startsOn,
        expiresOn,
        protocol: SASProtocol.Https,
      },
      userDelegationKey,
      env.BLOB_ACCOUNT_NAME,
    ).toString();
    return `${blob.url}?${sas}`;
  }
}

export const blobService = new BlobService();
