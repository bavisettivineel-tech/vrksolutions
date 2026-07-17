import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, Eye, HardDrive, BookmarkX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useOfflinePDFs, SavedPDF } from "@/hooks/useOfflinePDFs";
import PDFViewer from "@/components/PDFViewer";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const SavedPDFsPage = () => {
  const navigate = useNavigate();
  const { savedPDFs, isLoading, removePDF, getTotalStorageUsed, getPDFBlob } = useOfflinePDFs();
  const [selectedPDF, setSelectedPDF] = useState<SavedPDF | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfToDelete, setPdfToDelete] = useState<SavedPDF | null>(null);
  const [viewerUrl, setViewerUrl] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleViewPDF = async (pdf: SavedPDF) => {
    const blob = await getPDFBlob(pdf.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      setViewerUrl(url);
      setSelectedPDF(pdf);
      setShowPDFViewer(true);
    } else {
      toast.error("Failed to load PDF");
    }
  };

  const handleClosePDFViewer = (open: boolean) => {
    if (!open && viewerUrl) {
      URL.revokeObjectURL(viewerUrl);
      setViewerUrl(null);
    }
    setShowPDFViewer(open);
  };

  const handleDeletePDF = async () => {
    if (pdfToDelete) {
      const success = await removePDF(pdfToDelete.id);
      if (success) {
        toast.success("PDF removed from offline storage");
      } else {
        toast.error("Failed to remove PDF");
      }
      setPdfToDelete(null);
    }
  };

  const totalStorage = getTotalStorageUsed();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-semibold text-lg">Saved PDFs</h1>
            <p className="text-xs text-muted-foreground">Available offline</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Desktop Header */}
        <div className="hidden md:flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-display font-bold text-2xl">Saved PDFs</h1>
            <p className="text-muted-foreground">Access your study materials offline</p>
          </div>
        </div>

        {/* Storage Info */}
        <Card className="p-4 border-vrk-100">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg gradient-soft">
              <HardDrive className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Offline Storage</p>
              <p className="text-xs text-muted-foreground">
                {savedPDFs.length} PDF{savedPDFs.length !== 1 ? "s" : ""} saved • {formatFileSize(totalStorage)} used
              </p>
            </div>
          </div>
        </Card>

        {/* Saved PDFs List */}
        {savedPDFs.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2 border-vrk-200">
            <BookmarkX className="h-12 w-12 mx-auto text-vrk-300 mb-4" />
            <h3 className="font-display font-semibold text-lg text-muted-foreground">
              No Saved PDFs
            </h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
              Save PDFs for offline viewing by clicking the "Save Offline" button when viewing any PDF.
            </p>
            <Button className="mt-6 gradient-primary" onClick={() => navigate("/")}>
              Browse Study Materials
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedPDFs.map((pdf) => (
              <Card
                key={pdf.id}
                className="p-4 border-vrk-100 hover:shadow-card transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg gradient-soft flex-shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{pdf.title}</h4>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        Offline
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(pdf.fileSize)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Saved {formatDate(pdf.savedAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleViewPDF(pdf)}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => setPdfToDelete(pdf)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* PDF Viewer Dialog */}
      {selectedPDF && viewerUrl && (
        <PDFViewer
          open={showPDFViewer}
          onOpenChange={handleClosePDFViewer}
          fileUrl={viewerUrl}
          title={selectedPDF.title}
          contentId={selectedPDF.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!pdfToDelete} onOpenChange={() => setPdfToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Saved PDF?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{pdfToDelete?.title}" from your offline storage. 
              You can save it again later when connected to the internet.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePDF} className="bg-destructive text-destructive-foreground">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SavedPDFsPage;
