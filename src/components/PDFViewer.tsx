import { useState } from "react";
import { X, Download, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  title: string;
}

const PDFViewer = ({ open, onOpenChange, fileUrl, title }: PDFViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleOpenExternal = () => {
    window.open(fileUrl, "_blank");
  };

  // Use Google Docs Viewer for reliable PDF display
  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] p-0 gap-0" aria-describedby="pdf-dialog-description">
        <VisuallyHidden>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="pdf-dialog-description">
            PDF document viewer for {title}
          </DialogDescription>
        </VisuallyHidden>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-lg truncate">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
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
        <div className="flex-1 relative bg-muted/50">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading PDF...</p>
              </div>
            </div>
          )}
          <iframe
            src={googleViewerUrl}
            className="w-full h-full border-0"
            style={{ minHeight: "calc(90vh - 60px)" }}
            title={title}
            onLoad={() => setIsLoading(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
