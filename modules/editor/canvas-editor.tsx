import React from 'react'

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
    <div>
      canvas editor
    </div>
  )
}

export default CanvasEditor
