import { useState, useEffect } from "react";
import { X, Download, ExternalLink, Loader2, BookmarkPlus, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useOfflinePDFs } from "@/hooks/useOfflinePDFs";
import { toast } from "sonner";

interface PDFViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileUrl: string;
  title: string;
  contentId?: string;
}

const PDFViewer = ({ open, onOpenChange, fileUrl, title, contentId }: PDFViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { savePDF, removePDF, isPDFSaved, getPDFBlob } = useOfflinePDFs();
  const [isSaved, setIsSaved] = useState(false);
  const [offlineUrl, setOfflineUrl] = useState<string | null>(null);

  const pdfId = contentId || fileUrl;

  useEffect(() => {
    setIsSaved(isPDFSaved(pdfId));
  }, [pdfId, isPDFSaved]);

  useEffect(() => {
    // Check if we should use offline version
    const loadOfflineVersion = async () => {
      if (isPDFSaved(pdfId)) {
        const blob = await getPDFBlob(pdfId);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setOfflineUrl(url);
        }
      }
    };
    
    if (open) {
      loadOfflineVersion();
    }

    return () => {
      if (offlineUrl) {
        URL.revokeObjectURL(offlineUrl);
      }
    };
  }, [open, pdfId, isPDFSaved, getPDFBlob]);

  const handleDownload = () => {
    window.open(fileUrl, "_blank");
  };

  const handleOpenExternal = () => {
    window.open(fileUrl, "_blank");
  };

  const handleSaveOffline = async () => {
    setIsSaving(true);
    try {
      const success = await savePDF(pdfId, title, fileUrl);
      if (success) {
        setIsSaved(true);
        toast.success("PDF saved for offline viewing!");
      } else {
        toast.error("Failed to save PDF. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to save PDF. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveOffline = async () => {
    const success = await removePDF(pdfId);
    if (success) {
      setIsSaved(false);
      setOfflineUrl(null);
      toast.success("PDF removed from offline storage");
    } else {
      toast.error("Failed to remove PDF");
    }
  };

  // Use offline URL if available, otherwise use Google Docs Viewer
  const displayUrl = offlineUrl 
    ? offlineUrl 
    : `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`;

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
            {isSaved && (
              <span className="text-xs text-green-600 flex items-center gap-1">
                <BookmarkCheck className="h-3 w-3" />
                Saved offline
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Save for offline button */}
            {isSaved ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRemoveOffline}
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <BookmarkCheck className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Saved</span>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSaveOffline}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <BookmarkPlus className="h-4 w-4 mr-1" />
                )}
                <span className="hidden sm:inline">{isSaving ? "Saving..." : "Save Offline"}</span>
              </Button>
            )}
            
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
          {offlineUrl ? (
            <object
              data={offlineUrl}
              type="application/pdf"
              className="w-full h-full border-0"
              style={{ minHeight: "calc(90vh - 60px)" }}
              onLoad={() => setIsLoading(false)}
            >
              <p className="p-4 text-center text-muted-foreground">
                Unable to display PDF. <a href={offlineUrl} className="text-primary underline">Download instead</a>
              </p>
            </object>
          ) : (
            <iframe
              src={displayUrl}
              className="w-full h-full border-0"
              style={{ minHeight: "calc(90vh - 60px)" }}
              title={title}
              onLoad={() => setIsLoading(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PDFViewer;
