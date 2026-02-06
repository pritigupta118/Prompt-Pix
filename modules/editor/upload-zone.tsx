import { FileUpload } from '@/components/ui/file-upload';
import { Crown } from 'lucide-react';
import React, { useState } from 'react'


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
            // const imageUrl = await uploadToImageKit(imageFile);
            // setUploadedImage(imageUrl);
            // onImageUpload(imageUrl);
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



    return (
        <>
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
            <p className='text-muted-foreground text-sm flex justify-center'>
                {isUploading ? "Please wait while we upload your image" : "Drag & drop or click to browse"}
            </p>
           
        </div>
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
        </>
    );
}

export default UploadZone
