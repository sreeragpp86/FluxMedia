export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface UploadResponse {
  job_id: string;
  task_id: string;
  filename: string;
  saved_filename?: string;
  size_bytes?: number;
  crf?: number;
  status: string;
}

export interface TaskResultData {
  status?: string;
  file?: string;
  filename?: string;
  path?: string;
  download_url?: string;
  original_size?: number;
  output_size?: number;
  savings_pct?: number;
  crf?: number;
  message?: string;
  details?: string;
}

export interface TaskStatusResponse {
  task_id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "ERROR" | string;
  result?: TaskResultData | null;
  error?: string;
}

export interface SystemHealthResponse {
  status: "operational" | "degraded";
  storage: string;
  broker: string;
  max_upload_size_mb: number;
}

export async function uploadVideo(
  file: File,
  crf: number = 28,
  onProgress?: (percent: number) => void
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("crf", crf.toString());

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
        } catch {
          reject(new Error("Malformed JSON received from server."));
        }
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.detail || `Upload rejected with status ${xhr.status}`));
        } catch {
          reject(new Error(`Upload failed with HTTP ${xhr.status}`));
        }
      }
    };

    xhr.onerror = () => {
      reject(
        new Error(
          "Network connectivity error. Verify the FastAPI backend is running on http://localhost:8000."
        )
      );
    };

    xhr.send(formData);
  });
}

export async function checkTaskStatus(taskId: string): Promise<TaskStatusResponse> {
  const res = await fetch(`${API_BASE_URL}/status/${encodeURIComponent(taskId)}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to inspect task status (HTTP ${res.status})`);
  }
  return res.json();
}

export async function fetchSystemHealth(): Promise<SystemHealthResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export function getDownloadUrl(filename: string): string {
  return `${API_BASE_URL}/download/${encodeURIComponent(filename)}`;
}
