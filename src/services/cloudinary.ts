import "@/lib/cloudinary";
import { Readable } from "stream";
import { v2 as cldn, type UploadApiResponse, type UploadApiErrorResponse } from "cloudinary";

function fileToStream(file: File): Readable {
    const reader = file.stream().getReader();
    return new Readable({
        async read() {
            const { done, value } = await reader.read();
            if (done) this.push(null);
            else this.push(value);
        }
    });
}

export async function getAvatarUrl(id: string): Promise<string> {
    const result = await cldn.api.resource(`avatars/${id}`, {
        resource_type: "image"
    });
    return result.secure_url;
}

export async function getProductImageUrl(id: string): Promise<string> {
    const result = await cldn.api.resource(`products/${id}`, {
        resource_type: "image"
    });
    return result.secure_url;
}

export async function uploadAvatar({ id, file }: { id: string; file: File }): Promise<{ url: string }> {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cldn.uploader.upload_stream(
            {
                folder: "avatars",
                public_id: id,
                overwrite: true,
                resource_type: "image",
                format: "webp",
                transformation: [
                    {
                        width: 150,
                        height: 150,
                        crop: "fill",
                        gravity: "auto",
                        fetch_format: "auto",
                        quality: "auto"
                    }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) reject(error || new Error("Falló la subida de la imagen del avatar"));
                else resolve({ url: result.secure_url });
            }
        );

        fileToStream(file).pipe(uploadStream);
    });
}

export async function uploadProduct({ id, file }: { id: string; file: File }): Promise<{ url: string }> {
    return new Promise<{ url: string }>((resolve, reject) => {
        const uploadStream = cldn.uploader.upload_stream(
            {
                folder: "products",
                public_id: id,
                overwrite: true,
                resource_type: "image",
                format: "webp",
                transformation: [
                    {
                        width: 800,
                        height: 800,
                        crop: "limit",
                        fetch_format: "auto",
                        quality: "auto"
                    }
                ]
            },
            (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error || !result) reject(error || new Error("Falló la subida de la imagen del producto"));
                else resolve({ url: result.secure_url });
            }
        );

        fileToStream(file).pipe(uploadStream);
    });
}
