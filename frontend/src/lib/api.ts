export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UploadResponse {
  job_id: string;
  task_id: string;
  filename: string;
  saved_filename?: string;
  status: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR" | string;
  result?: {
    status?: string;
    file?: string;
    filename?: string;
    path?: string;
    download_url?: string;
    message?: string;
    details?: string;
  } | null;
  error?: string;
}

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE_URL}/upload`);

    if (onProgress && xhr.upload) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          resolve(json);
        } catch (e) {
          reject(new Error("Failed to parse response JSON"));
        }
      } else {
        try {
          const errorJson = JSON.parse(xhr.responseText);
          reject(new Error(errorJson.detail || `Upload failed with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("Network error connecting to backend at " + API_BASE_URL));
    };

    xhr.send(formData);
  });
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/status/${taskId}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch status: ${res.statusText}`);
  }
  return res.json();
}

export function getDownloadUrl(filename: string): string {
  return `${API_BASE_URL}/download/${encodeURIComponent(filename)}`;
}
