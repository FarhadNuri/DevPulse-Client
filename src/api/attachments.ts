import { request } from "./client";
import type { Attachment } from "../types";

export interface SignAttachmentResponse {
  upload_url: string;
  params: {
    api_key: string;
    timestamp: number;
    signature: string;
    folder: string;
    public_id: string;
  };
}

export const attachments = {
  sign: (
    orgId: number,
    issueId: number,
    data: { file_name: string; mime_type: string; size_bytes: number }
  ) =>
    request<SignAttachmentResponse>(
      `/api/orgs/${orgId}/issues/${issueId}/attachments/sign`,
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  create: (
    orgId: number,
    issueId: number,
    data: {
      url: string;
      public_id: string;
      file_name: string;
      mime_type: string;
      size_bytes: number;
    }
  ) =>
    request<Attachment>(`/api/orgs/${orgId}/issues/${issueId}/attachments`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  remove: (orgId: number, attachmentId: number) =>
    request<void>(`/api/orgs/${orgId}/attachments/${attachmentId}`, {
      method: "DELETE",
    }),
};

/**
 * Uploads a file directly to Cloudinary using signed parameters and XMLHttpRequest for progress reporting.
 */
export async function uploadToCloudinary(
  signResult: SignAttachmentResponse,
  file: File,
  onProgress?: (percent: number) => void
): Promise<{ url: string; public_id: string }> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", signResult.params.api_key);
    formData.append("timestamp", signResult.params.timestamp.toString());
    formData.append("signature", signResult.params.signature);
    formData.append("folder", signResult.params.folder);
    formData.append("public_id", signResult.params.public_id);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signResult.upload_url);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const res = JSON.parse(xhr.responseText);
          resolve({
            url: res.secure_url || res.url,
            public_id: res.public_id || signResult.params.public_id,
          });
        } catch {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        try {
          const errRes = JSON.parse(xhr.responseText);
          reject(new Error(errRes.error?.message || "Cloudinary upload failed"));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => reject(new Error("Network error during Cloudinary upload"));
    xhr.send(formData);
  });
}

