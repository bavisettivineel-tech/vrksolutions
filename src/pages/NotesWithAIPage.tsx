import { useState } from "react";
import { Search, Loader2, Sparkles, BookOpen, ArrowLeft, History, Trash2, Clock, FileText, ExternalLink, Globe, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const NOTES_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-notes`;

const SUGGESTIONS = [
  "Diploma 1st Year C Programming",
  "10th Class Telugu Grammar",
  "Intermediate MPC Mathematics Trigonometry",
  "B-Tech Data Structures Arrays",
  "EAPCET Physics Electrostatics",
  "Diploma 2nd Year Java OOPs",
  "Intermediate BiPC Botany Cell Biology",
  "B-Tech Operating Systems Process Management",
];

interface PDFResult {
  title: string;
  url: string;
  description: string;
  isDirectPDF: boolean;
}

interface WebResult {
  title: string;
  url: string;
  description: string;
}

interface SearchResult {
  query: string;
  pdfResults: PDFResult[];
  webResults: WebResult[];
  totalFound: number;
}

interface NotesHistoryItem {
  id: string;
  query: string;
  result: SearchResult;
  createdAt: string;
}

const HISTORY_KEY = "vrk-notes-history";

const getHistory = (): NotesHistoryItem[] => {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveToHistory = (query: string, result: SearchResult) => {
  const history = getHistory();
  const item: NotesHistoryItem = {
    id: Date.now().toString(),
    query,
    result,
    createdAt: new Date().toISOString(),
  };
  const updated = [item, ...history].slice(0, 20);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
};

const deleteFromHistory = (id: string) => {
  const history = getHistory().filter(h => h.id !== id);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
};

const NotesWithAIPage = () => {
  const [query, setQuery] = useState("");
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showAllPDFs, setShowAllPDFs] = useState(false);
  const [showAllWeb, setShowAllWeb] = useState(false);
  const [history, setHistory] = useState<NotesHistoryItem[]>(getHistory);
  const navigate = useNavigate();

  const handleSearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim() || isLoading) return;

    setSearchResult(null);
    setCurrentQuery(q.trim());
    setIsLoading(true);
    setShowHistory(false);

    try {
      const response = await fetch(NOTES_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ query: q.trim() }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Search failed");
      }

      const data: SearchResult = await response.json();
      setSearchResult(data);
      setShowAllPDFs(false);
      setShowAllWeb(false);

      if (data.pdfResults.length > 0 || data.webResults.length > 0) {
        const updated = saveToHistory(q.trim(), data);
        setHistory(updated);
        toast.success(`Found ${data.pdfResults.length} PDF resources!`);
      } else {
        toast.info("No results found. Try a different search term.");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error(error instanceof Error ? error.message : "Search failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (item: NotesHistoryItem) => {
    setQuery(item.query);
    setCurrentQuery(item.query);
    setSearchResult(item.result);
    setShowHistory(false);
  };

  const removeFromHistory = (id: string) => {
    const updated = deleteFromHistory(id);
    setHistory(updated);
    toast.success("Removed from history");
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const openLink = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = title || "document.pdf";
    link.click();
  };

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-20">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg gradient-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl">Notes with AI</h1>
                <p className="text-xs text-muted-foreground">Find official notes & PDFs from the web</p>
              </div>
            </div>
          </div>
          {history.length > 0 && (
            <Button
              variant={showHistory ? "default" : "outline"}
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
              className={showHistory ? "gradient-primary" : ""}
            >
              <History className="h-4 w-4 mr-1" />
              History ({history.length})
            </Button>
          )}
        </div>

        {/* Search */}
        <Card className="p-4 border-vrk-100 mb-6">
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Diploma 1st year C programming notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              disabled={isLoading}
              className="border-vrk-200"
            />
            <Button
              onClick={() => handleSearch()}
              disabled={!query.trim() || isLoading}
              className="gradient-primary flex-shrink-0"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
        </Card>

        {/* History Panel */}
        {showHistory && (
          <Card className="border-vrk-100 mb-6 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-border gradient-soft">
              <h3 className="font-semibold text-sm flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" /> Recent Searches
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-border">
              {history.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                  <button
                    onClick={() => loadFromHistory(item)}
                    className="flex-1 text-left"
                  >
                    <p className="text-sm font-medium truncate">{item.query}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(item.createdAt)} · {item.result.pdfResults.length} PDFs found</p>
                  </button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFromHistory(item.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Suggestions */}
        {!searchResult && !isLoading && !showHistory && (
          <div className="space-y-4 animate-fade-in">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Popular Searches
            </h3>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setQuery(s);
                    handleSearch(s);
                  }}
                  className="px-3 py-2 text-sm rounded-full border border-vrk-200 hover:bg-vrk-50 hover:border-primary transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>

            <Card className="p-6 text-center border-dashed border-2 border-vrk-200 mt-8">
              <Sparkles className="h-10 w-10 mx-auto text-primary mb-3" />
              <h3 className="font-display font-semibold text-lg">Official Notes Finder</h3>
              <p className="text-muted-foreground text-sm mt-2 max-w-md mx-auto">
                Search for any topic and find official study notes, PDFs, and learning resources from across the web. 
                Download them directly to study offline.
              </p>
            </Card>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <Card className="border-vrk-100 p-8 text-center animate-fade-in">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-3" />
            <p className="font-medium">Searching the web for official notes...</p>
            <p className="text-sm text-muted-foreground mt-1">Finding PDFs and study materials for "{currentQuery}"</p>
          </Card>
        )}

        {/* Results */}
        {searchResult && !isLoading && (
          <div className="space-y-6 animate-fade-in">
            {/* Summary */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Found <span className="font-semibold text-foreground">{searchResult.pdfResults.length}</span> PDF resources 
                and <span className="font-semibold text-foreground">{searchResult.webResults.length}</span> web resources
              </p>
            </div>

            {/* PDF Results */}
            {searchResult.pdfResults.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-red-500" />
                  PDF Notes & Study Materials
                </h3>
                <div className="space-y-3">
                  {(showAllPDFs ? searchResult.pdfResults : searchResult.pdfResults.slice(0, 3)).map((pdf, i) => (
                    <Card
                      key={i}
                      className="p-4 hover:shadow-card transition-all cursor-pointer border-vrk-100 hover:border-primary/30"
                      onClick={() => openLink(pdf.url)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${pdf.isDirectPDF ? "bg-red-100 dark:bg-red-900/30" : "bg-orange-100 dark:bg-orange-900/30"}`}>
                          <FileText className={`h-5 w-5 ${pdf.isDirectPDF ? "text-red-600 dark:text-red-400" : "text-orange-600 dark:text-orange-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{pdf.title}</h4>
                          {pdf.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{pdf.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {pdf.isDirectPDF && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">
                                Direct PDF
                              </span>
                            )}
                            <span className="text-[10px] text-muted-foreground truncate max-w-[200px]">
                              {new URL(pdf.url).hostname}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Download PDF"
                            onClick={(e) => handleDownload(e, pdf.url, pdf.title)}
                          >
                            <Download className="h-4 w-4 text-primary" />
                          </Button>
                          <ExternalLink className="h-4 w-4 text-muted-foreground mt-1" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
                {searchResult.pdfResults.length > 3 && !showAllPDFs && (
                  <Button
                    variant="outline"
                    className="w-full mt-3"
                    onClick={() => setShowAllPDFs(true)}
                  >
                    <ChevronDown className="h-4 w-4 mr-2" />
                    Show More ({searchResult.pdfResults.length - 3} more PDFs)
                  </Button>
                )}
              </div>
            )}

            {/* Web Results */}
            {searchResult.webResults.length > 0 && (
              <div>
                <h3 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Web Resources
                </h3>
                <div className="space-y-3">
                  {searchResult.webResults.map((web, i) => (
                    <Card
                      key={i}
                      className="p-4 hover:shadow-card transition-all cursor-pointer border-vrk-100 hover:border-primary/30"
                      onClick={() => openLink(web.url)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex-shrink-0">
                          <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2">{web.title}</h4>
                          {web.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{web.description}</p>
                          )}
                          <span className="text-[10px] text-muted-foreground mt-1 block truncate">
                            {new URL(web.url).hostname}
                          </span>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {searchResult.pdfResults.length === 0 && searchResult.webResults.length === 0 && (
              <Card className="p-8 text-center border-dashed border-2 border-vrk-200">
                <Search className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                <h3 className="font-semibold">No results found</h3>
                <p className="text-sm text-muted-foreground mt-1">Try different keywords or a more specific search</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesWithAIPage;
