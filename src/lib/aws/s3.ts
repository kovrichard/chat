import conf from "@/lib/config";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

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
