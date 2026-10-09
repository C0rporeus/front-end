import { apiRequest, ApiClientError } from "@/api/http-client";
import { API_PRIVATE_UPLOAD_IMAGE } from "@/api/endpoints";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3100";

/** Límite de tamaño para subida de imagen (5 MB), alineado con backend. */
export const MAX_IMAGE_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Tipos MIME permitidos para imágenes. */
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function isAllowedImageType(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type);
}

export type UploadedImage = {
  /** URL canónica (sin firma) que se persiste en el contenido. */
  url: string;
  /** URL firmada temporal para renderizar la imagen; el bucket es privado. */
  previewUrl: string;
};

/**
 * Sube un archivo de imagen al backend; el backend lo almacena en GCP/Firebase Storage
 * y devuelve la URL canónica junto con una URL firmada para vista previa. Requiere JWT.
 */
export async function uploadImageWithPreview(file: File): Promise<UploadedImage> {
  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    throw new Error(
      `El archivo supera el límite de ${MAX_IMAGE_UPLOAD_BYTES / 1024 / 1024} MB`,
    );
  }
  if (!isAllowedImageType(file.type)) {
    throw new Error(
      "Tipo de archivo no permitido. Usa JPEG, PNG, GIF o WebP.",
    );
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${baseURL}${API_PRIVATE_UPLOAD_IMAGE}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (response.status === 401 && typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("auth:expired"));
  }

  const data = (await response.json()) as {
    url?: string;
    previewUrl?: string;
    message?: string;
    code?: string;
  };
  if (!response.ok) {
    throw new ApiClientError(
      data.message ?? "No fue posible subir la imagen",
      { code: data.code },
    );
  }
  if (typeof data.url !== "string" || !data.url.trim()) {
    throw new ApiClientError("La respuesta del servidor no incluyó la URL de la imagen");
  }
  const url = data.url.trim();
  const previewUrl = typeof data.previewUrl === "string" && data.previewUrl.trim()
    ? data.previewUrl.trim()
    : url;
  return { url, previewUrl };
}

/** Sube una imagen y devuelve solo la URL canónica para persistir. */
export async function uploadImage(file: File): Promise<string> {
  return (await uploadImageWithPreview(file)).url;
}
