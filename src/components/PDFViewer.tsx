import { useState } from "react";
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  title: string;
}

const PDFViewer = ({ open, onOpenChange, fileUrl, title }: PDFViewerProps) => {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleOpenExternal = () => {
    window.open(fileUrl, "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg truncate">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom controls */}
            <div className="hidden sm:flex items-center gap-1 mr-2">
              <Button variant="ghost" size="icon" onClick={handleZoomOut} disabled={zoom <= 50}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" onClick={handleZoomIn} disabled={zoom >= 200}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleResetZoom}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Action buttons */}
            <Button variant="outline" size="sm" onClick={handleOpenExternal}>
              <ExternalLink className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Open</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-muted/50">
          <div 
            className="w-full h-full flex items-center justify-center p-4"
            style={{ minHeight: "calc(90vh - 60px)" }}
          >
            <iframe
              src={`${fileUrl}#zoom=${zoom}`}
              className="w-full h-full border-0 rounded-lg shadow-lg bg-white"
              style={{ 
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                minHeight: "100%"
              }}
              title={title}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
