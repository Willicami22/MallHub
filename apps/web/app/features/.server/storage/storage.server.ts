import {
	CreateBucketCommand,
	HeadBucketCommand,
	PutBucketPolicyCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import { serverEnv } from '@/features/.server/env/server-env.lib';

export const s3 = new S3Client({
	endpoint: serverEnv.MINIO_ENDPOINT,
	region: 'us-east-1',
	credentials: {
		accessKeyId: serverEnv.MINIO_ACCESS_KEY,
		secretAccessKey: serverEnv.MINIO_SECRET_KEY,
	},
	forcePathStyle: true,
});

export const STORAGE_BUCKET = serverEnv.MINIO_BUCKET;
export const STORAGE_PUBLIC_URL = serverEnv.MINIO_PUBLIC_URL;

let bucketReady = false;

export async function ensureBucket(): Promise<void> {
	if (bucketReady) return;

	try {
		await s3.send(new HeadBucketCommand({ Bucket: STORAGE_BUCKET }));
	} catch {
		await s3.send(new CreateBucketCommand({ Bucket: STORAGE_BUCKET }));
	}

	// Allow public reads so image URLs work without signing
	const policy = JSON.stringify({
		Version: '2012-10-17',
		Statement: [
			{
				Effect: 'Allow',
				Principal: '*',
				Action: ['s3:GetObject'],
				Resource: [`arn:aws:s3:::${STORAGE_BUCKET}/*`],
			},
		],
	});

	await s3.send(
		new PutBucketPolicyCommand({ Bucket: STORAGE_BUCKET, Policy: policy }),
	);

	bucketReady = true;
}
