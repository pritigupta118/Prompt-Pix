import { motion } from "framer-motion"
import { Loader2 } from "lucide-react";
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
  const [sliderPosition, setSliderPosition] = useState(50);


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
      className="relative glass rounded-xl border border-card-border overflow-hidden aspect-[4/3]"
      >
      {
        isProcessing  && (
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
      </motion.div>
       {/* {
        showComparison && processedImage ? (

        )
       } */}
    </div>
  )
}

export default CanvasEditor
