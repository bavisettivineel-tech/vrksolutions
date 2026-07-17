import { useState, useEffect, useRef } from "react";
import { Search, FileText, Calendar, BarChart3, Video, X, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import PDFViewer from "@/components/PDFViewer";

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  content_type: string;
  file_url: string | null;
  file_name: string | null;
  category_id: string | null;
  categories?: { name: string } | null;
}

interface ContentSearchProps {
  className?: string;
}

const ContentSearch = ({ className }: ContentSearchProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ContentItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      searchContent(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query]);

  const searchContent = async (searchQuery: string) => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from("content")
        .select(`
          id,
          title,
          description,
          content_type,
          file_url,
          file_name,
          category_id,
          categories (name)
        `)
        .eq("is_active", true)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      setResults(data || []);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleViewContent = (item: ContentItem) => {
    if (item.file_url) {
      if (item.content_type === "pdf" || item.file_name?.toLowerCase().endsWith(".pdf")) {
        setSelectedContent(item);
        setShowPDFViewer(true);
        setShowResults(false);
      } else {
        window.open(item.file_url, "_blank");
      }
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case "pdf":
      case "notes":
        return FileText;
      case "timetable":
        return Calendar;
      case "weightage":
        return BarChart3;
      case "video":
        return Video;
      default:
        return FileText;
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setShowResults(false);
  };

  return (
    <>
      <div ref={searchRef} className={`relative ${className}`}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search study materials..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            className="pl-10 pr-10 bg-background border-vrk-200 focus:border-primary"
          />
          {query && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showResults && (
          <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-80 overflow-y-auto shadow-lg border-vrk-100">
            {isSearching ? (
              <div className="p-4 text-center">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm text-muted-foreground mt-2">Searching...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No results found for "{query}"</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((item) => {
                  const Icon = getContentIcon(item.content_type);
                  return (
                    <button
                      key={item.id}
                      className="w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors text-left"
                      onClick={() => handleViewContent(item)}
                    >
                      <div className="p-2 rounded-lg gradient-soft flex-shrink-0">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {item.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.content_type}
                          </Badge>
                          {item.categories?.name && (
                            <span className="text-xs text-muted-foreground">
                              {item.categories.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* PDF Viewer */}
      {selectedContent && selectedContent.file_url && (
        <PDFViewer
          open={showPDFViewer}
          onOpenChange={setShowPDFViewer}
          fileUrl={selectedContent.file_url}
          title={selectedContent.title}
        />
      )}
    </>
  );
};

export default ContentSearch;
