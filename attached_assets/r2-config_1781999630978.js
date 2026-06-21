// R2 Configuration
// Credentials are loaded from environment variables
// Copy .env.example to .env and fill in your credentials

const R2_CONFIG = {
    accountId: process.env.R2_ACCOUNT_ID || '',
    bucketName: process.env.R2_BUCKET_NAME || 'kindo-images',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    publicUrl: process.env.R2_PUBLIC_URL || '',
    workerUrl: process.env.WORKER_URL || ''
};
