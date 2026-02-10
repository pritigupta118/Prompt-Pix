import { Button } from "@/components/ui/button";
import { Compare } from "@/components/ui/compare";
import { motion } from "framer-motion"
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface CanvasEditorProps {
  originalImage: string | null;
  processedImage: string | null;
  isProcessing: boolean;
}


const CanvasEditor = ({
  originalImage,
  processedImage,
  isProcessing
}: CanvasEditorProps) => {
  const [showComparison, setShowComparison] = useState(false);
  
  if (!originalImage) {
    return (
      <div className="shadow-glass rounded-xl border border-gray-800 aspect-4/3 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
            <span className="text-2xl">🎨</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Ready for Magic
          </h3>
          <p className="text-muted-foreground">
            Upload a photo to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>

      <motion.div
        layout
        className="relative glass rounded-xl border border-card-border overflow-hidden aspect-4/3"
      >
        {
          isProcessing && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-3 text-primary animate-spin" />
                <p className="text-foreground font-medium">
                  AI is working its magic...
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  This usually takes a few seconds
                </p>
              </div>
            </div>
          )
        } 

         {
          showComparison && processedImage ? (
        <div className="relative w-full h-full p-4 border rounded-xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 px-4">
      <Compare
        firstImage={originalImage}
        secondImage={processedImage}
        firstImageClassName="object-cover object-left-top"
        secondImageClassname="object-cover object-left-top"
        className="h-full w-full"
        slideMode="hover"
      />
    </div>
          ) : (
            <div className="w-full h-full">
              <Image src={processedImage || originalImage} alt={processedImage ? "Processed" : "Original"}
                className="w-full h-full object-contain"
              />
            </div>
          )
        }

        {
          processedImage && (
             <div className="absolute top-4 right-4">
              <Button
              variant="outline"
              size="sm"
              onClick={() => setShowComparison(!showComparison)}
              className="glass bg-background/20 border-foreground/20 text-foreground hover:bg-background/40"
              >
            
                {
                  showComparison ? (
                    <>
                    <EyeOff className="h-4 w-4"/>
                    Hide Compare
                    </>
                  ) : (
                    <>
                    <Eye className="h-4 w-4"/>
                    Compare
                    </>
                  )
                }
                
              </Button>
             </div>
          )
        }
      </motion.div>

      <div className="text-center">
       
        {
          isProcessing ? (
            <p className="text-sm text-primary">Processing with AI...</p>
          ) : processedImage ?(
          <p className="text-sm text-primary">
            ✨ Magic applied! Compare or export your result
          </p>
          ) : (
             <p className="text-sm text-muted-foreground">
            Select a tool to start editing
          </p>
          )
        }
      </div>

    </div>
    
    

  )
}

export default CanvasEditor
