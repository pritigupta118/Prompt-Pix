import { FileUpload } from '@/components/ui/file-upload';
import React, { useState } from 'react'


interface UploadZoneProps {
    onImageUpload: (imgUrl: string) => void
}
const UploadZone = ({ onImageUpload }: UploadZoneProps) => {
    const [isUploading, setIsUploading] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false)
    const [usageData, setUsageData] = useState<{
        usageCount: number;
        usageLimit: number;
        plan: string;
        canUpload: boolean;
    } | null>(null);


    const handleFileUpload = async (files: File[]) => {

        const imageFile = files?.find((file) => file.type.startsWith("image/"));
        if (!imageFile) {
            return;
        }
        setIsUploading(true)

        try {
            const usage = await checkUsage();

            if (!usage.canUpload) {
                setShowPaymentModal(true);
            }
        } catch (error) {
            console.error(error);
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

    return (
        <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-white dark:bg-black border-neutral-200 dark:border-neutral-800 rounded-lg">
            <FileUpload onChange={handleFileUpload} />
        </div>
    );
}

export default UploadZone
