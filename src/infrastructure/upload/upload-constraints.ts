export const UPLOAD_TASK_FILE = {
  allowedMimeTypes: [
    'image/png',
    'image/jpeg',
    'image/webp',
    'image/svg+xml',
    'image/heif',
    'image/heic',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
  maxSizeBytes: 10 * 1024 * 1024,
} as const;
