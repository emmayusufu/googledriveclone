import {
  v2 as cloudinary,
  DeleteApiResponse,
  UploadApiErrorResponse,
  UploadApiResponse,
} from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    await new Promise((resolve) => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * 2);
  }
}

export async function uploadFile(
  buffer: Buffer,
  options: {
    userId: string;
    parentId?: string | null;
    fileName: string;
    mimeType: string;
  }
): Promise<UploadApiResponse> {
  const base64Data = buffer.toString("base64");
  const uniqueFileName = `${Date.now()}-${options.fileName.replace(
    /\s/g,
    "_"
  )}`;

  const folderPath = getCloudinaryPath(options.userId, options.parentId);

  return retryOperation(() => {
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload(
        `data:${options.mimeType};base64,${base64Data}`,
        {
          folder: folderPath,
          public_id: uniqueFileName.split(".")[0],
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else if (!result) reject(new Error("Upload failed with no result"));
          else resolve(result);
        }
      );
    });
  });
}

export async function deleteFile(publicId: string): Promise<DeleteApiResponse> {
  return retryOperation(() => {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      });
    });
  });
}

export async function createFolder(
  userId: string,
  folderId: string,
  parentId?: string | null
): Promise<string> {
  const path = getCloudinaryPath(userId, parentId, folderId);

  await retryOperation(() => {
    return new Promise((resolve, reject) => {
      cloudinary.api.create_folder(
        path,
        (
          error: UploadApiErrorResponse | undefined,
          result: UploadApiResponse
        ) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
  });

  return path;
}

export async function deleteFolder(
  path: string
): Promise<UploadApiResponse | { message: string }> {
  return retryOperation(() => {
    return new Promise<UploadApiResponse | { message: string }>(
      (resolve, reject) => {
        cloudinary.api.delete_folder(
          path,
          (
            error: UploadApiErrorResponse | undefined,
            result: UploadApiResponse
          ) => {
            if (error) {
              if (error.http_code === 404) {
                resolve({ message: "Folder already deleted" });
              } else {
                reject(error);
              }
            } else {
              resolve(result);
            }
          }
        );
      }
    );
  });
}

function getCloudinaryPath(
  userId: string,
  parentId?: string | null,
  currentFolderId?: string
) {
  let path = `uploads/${userId}`;

  if (parentId) {
    path += `/${parentId}`;
  }

  if (currentFolderId) {
    path += `/${currentFolderId}`;
  }

  return path;
}
