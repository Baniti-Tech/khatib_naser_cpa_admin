/**
 * Google Cloud Storage stub for image uploads.
 * Wire @google-cloud/storage after the bucket + service account exist.
 */

export type UploadResult = {
  ok: boolean;
  publicUrl?: string;
  objectPath?: string;
  error?: string;
};

const useMock = process.env.USE_MOCK_DATA !== "false";

export async function uploadImage(params: {
  slotKey: string;
  fileName: string;
  contentType: string;
  bytes: Buffer;
}): Promise<UploadResult> {
  const { slotKey, fileName, contentType, bytes } = params;

  if (useMock || !process.env.GCS_BUCKET) {
    const fakeUrl = `https://storage.googleapis.com/mock-bucket/${slotKey}/${fileName}`;
    console.info("[mock gcs] uploadImage", {
      slotKey,
      fileName,
      contentType,
      bytes: bytes.length,
      publicUrl: fakeUrl,
    });
    return { ok: true, publicUrl: fakeUrl, objectPath: `${slotKey}/${fileName}` };
  }

  // TODO:
  // const { Storage } = await import("@google-cloud/storage");
  // const storage = new Storage({ projectId: process.env.GCS_PROJECT_ID });
  // const bucket = storage.bucket(process.env.GCS_BUCKET!);
  // const objectPath = `site/${slotKey}/${Date.now()}-${fileName}`;
  // await bucket.file(objectPath).save(bytes, { contentType, resumable: false, public: true });
  // return { ok: true, publicUrl: `https://storage.googleapis.com/${bucket.name}/${objectPath}`, objectPath };

  return { ok: false, error: "GCS not configured yet. Set USE_MOCK_DATA=true or wire lib/storage.ts." };
}
