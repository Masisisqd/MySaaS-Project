"use client";

import React, { useState } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirebaseFunctions } from '@/lib/firebase/config';
import { pdf } from '@react-pdf/renderer';
import { QBRDocument, QBRData } from './QBRDocument';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface ExportQBRButtonProps {
    companyId: string;
}

export const ExportQBRButton: React.FC<ExportQBRButtonProps> = ({ companyId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleExport = async () => {
        setIsLoading(true);
        try {
            const functions = getFirebaseFunctions();
            const exportQBRData = httpsCallable<{ companyId: string }, { success: boolean; data: QBRData }>(
                functions,
                'exportQBRData'
            );

            // Fetch the aggregated data
            const response = await exportQBRData({ companyId });
            
            if (!response.data || !response.data.success) {
                throw new Error("Invalid response from server");
            }

            const qbrData = response.data.data;

            // Generate PDF Blob client-side
            const asPdf = pdf(<QBRDocument data={qbrData} />);
            const blob = await asPdf.toBlob();

            // Trigger file download
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `QBR_${qbrData.companyName.replace(/\s+/g, '_')}_Q1_2026.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success("QBR Exported successfully");
        } catch (error) {
            console.error("Error exporting QBR:", error);
            toast.error("Failed to export QBR. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleExport} 
            disabled={isLoading}
            variant="outline"
            className="flex items-center gap-2"
        >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isLoading ? "Generating..." : "Export QBR"}
        </Button>
    );
};
