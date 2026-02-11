import { FileUpload } from '@/components/ui/file-upload';
import { Crown, X } from 'lucide-react';
import { useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { ImageKitInvalidRequestError, ImageKitServerError, ImageKitUploadNetworkError, upload } from "@imagekit/next"
import Image from 'next/image';



interface UploadZoneProps {
    onImageUpload: (imgUrl: string) => void
}
const UploadZone = ({ onImageUpload }: UploadZoneProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [usageData, setUsageData] = useState<{
        usageCount: number;
        usageLimit: number;
        plan: string;
        canUpload: boolean;
    } | null>(null);

    useEffect(() => {
        checkUsage()?.catch(console.error)
    }, [])

    const getUploadAuthParams = async () => {
        const response = await fetch("/api/upload-auth")

        if (!response.ok) {
            throw new Error("Failed to get upload auth params");
        }
        const data = await response?.json();

        return data;
    }

    const uploadToImageKit = async (file: File): Promise<string> => {
        try {
            const { token, expire, signature, publicKey } =
                await getUploadAuthParams();

            const result = await upload({
                file,
                fileName: file?.name,
                folder: "prompt-pix-upload",
                expire,
                token,
                signature,
                publicKey,
                onProgress: (event) => {
                    // Update progress if needed
                    console.log(
                        `Upload progress: ${(event.loaded / event.total) * 100}%`
                    );
                },
            })

            return result.url || ""
        } catch (error) {
            if (error instanceof ImageKitInvalidRequestError) {
                throw new Error("Invalid upload request");
            } else if (error instanceof ImageKitServerError) {
                throw new Error("ImageKit server error");
            } else if (error instanceof ImageKitUploadNetworkError) {
                throw new Error("Network error during upload");
            } else {
                throw new Error("Upload failed");
            }
        }
    }

    const handleFileUpload = async (files: File[]) => {
        const imageFile = files.find(file =>
            file.type.startsWith("image/")
        );

        if (!imageFile) {
            console.warn("Non-image file attempted");
            return;
        }

        setIsUploading(true);

        try {
            /* ---------- 1. Early Usage Check ---------- */
            const usage = await checkUsage();

            if (!usage.canUpload) {
                setUsageData(usage);
                setShowPaymentModal(true);
                return;
            }

            /* ---------- 2. Upload Image ---------- */
            const imageUrl = await uploadToImageKit(imageFile);
            setUploadedImage(imageUrl);
            onImageUpload(imageUrl);
            /* ---------- 3. Increment Usage ---------- */
            const updatedUsage = await updateUsage();
            setUsageData(updatedUsage);

        } catch (error) {

            /* ---------- Handle Usage Limit Edge Case ---------- */
            if (
                typeof error === "object" &&
                error !== null &&
                "status" in error &&
                (error as any).status === 403
            ) {
                setUsageData((error as any).data);
                setShowPaymentModal(true);
                return;
            }

            /* ---------- Generic Error Handling ---------- */
            console.error("Upload pipeline failed:", error);

            // optional toast/snackbar here

        } finally {
            setIsUploading(false);
        }
    };

    const checkUsage = async () => {
        const response = await fetch("/api/usage");

        if (!response.ok) {
            throw new Error("Failed to check usage");
        }

        const data = await response.json();
        setUsageData(data);

        return data;
    };

    const updateUsage = async () => {
        const response = await fetch("/api/usage", {
            method: "POST",
        });

        const data = await response.json();

        if (!response.ok) {
            const error = new Error("Usage update failed");
            (error as any).status = response.status;
            (error as any).data = data;
            throw error;
        }

        return data;
    };

    const clearImage = () => {
        setUploadedImage(null)
        onImageUpload("")
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
            {
                uploadedImage ? (
                    <div className="relative glass rounded-xl p-4 border border-card-border">
                        <button
                            onClick={clearImage}
                            className="absolute top-2 right-2 z-10 p-1 bg-background/80 rounded-full hover:bg-destructive/20 transition-colors"
                        >
                            <X className="h-4 w-4 text-foreground hover:text-destructive" />
                        </button>

                        <div className="aspect-square rounded-lg overflow-hidden">
                            <Image
                                src={uploadedImage}
                                alt="Uploaded Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="mt-3 text-center">
                            <p className="text-sm font-medium text-foreground">
                                {uploadedImage.startsWith("data:")
                                    ? "Local preview"
                                    : "Uploaded to cloud"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Ready for AI magic ✨
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <FileUpload onChange={handleFileUpload} />
                        <p className='text-muted-foreground text-sm flex justify-center'>
                            {isUploading ? "Please wait while we upload your image" : "Drag & drop or click to browse"}
                        </p>

                    </div>
                )
            }
            {
                usageData && (
                    <div className="mt-4 text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-muted-foreground">
                            <span>
                                Usage: {usageData.usageCount}/{usageData.usageLimit}
                            </span>
                            {usageData.plan === "Free" && (
                                <Crown className='h-3 w-3 text-primary' />
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Supports JPG, PNG, WebP up to 10MB
                        </p>
                    </div>
                )
            }
        </motion.div>
    );
}

export default UploadZone
