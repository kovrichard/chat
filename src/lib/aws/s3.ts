import conf from "@/lib/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/cloudfront-signer";

const client = new S3Client({
  region: conf.awsRegion,
});

export async function uploadFile(file: File, key: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const command = new PutObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
    Body: buffer,
    ContentType: file.type,
  });

  const response = await client.send(command);

  return response;
}

export async function deleteFile(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: conf.awsUploadsBucket,
    Key: key,
  });

  const response = await client.send(command);

  return response;
}

export function getFileUrlSigned(key: string) {
  const cloudfrontDistributionDomain = `https://${conf.awsUploadsBucket}`;
  const url = `${cloudfrontDistributionDomain}/${key}`;
  const privateKey = conf.awsCloudfrontPrivateKey;
  const keyPairId = conf.awsCloudfrontKeyPairId;
  const dateLessThan = new Date(Date.now() + 60 * 60 * 1000);

  const urlSigned = getSignedUrl({ url, keyPairId, dateLessThan, privateKey });

  return urlSigned;
}
