import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, X, FileText, Image } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Subject {
  id: string;
  name: string;
  category_id: string;
}

interface FileUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "content" | "advertisement";
  onSuccess: () => void;
}

const FileUploadDialog = ({
  open,
  onOpenChange,
  type,
  onSuccess,
}: FileUploadDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contentType, setContentType] = useState<string>("pdf");
  const [linkUrl, setLinkUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open && type === "content") {
      fetchCategories();
    }
  }, [open, type]);

  // Fetch subjects when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      fetchSubjects(selectedCategoryId);
    } else {
      setSubjects([]);
      setSelectedSubjectId("");
    }
  }, [selectedCategoryId]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("sort_order");
    if (data) setCategories(data);
  };

  const fetchSubjects = async (categoryId: string) => {
    const { data } = await supabase
      .from("subjects")
      .select("id, name, category_id")
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("sort_order");
    if (data) setSubjects(data);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validate file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Maximum file size is 50MB",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file || !title.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide a title and select a file",
        variant: "destructive",
      });
      return;
    }

    if (type === "content" && !selectedCategoryId) {
      toast({
        title: "Missing category",
        description: "Please select a grade/category for this content",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const bucket = type === "content" ? "content-files" : "advertisements";
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${type}/${fileName}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      const fileUrl = urlData.publicUrl;

      if (type === "content") {
        // Insert content record
        const { error: insertError } = await supabase.from("content").insert({
          title,
          description,
          content_type: contentType,
          file_url: fileUrl,
          file_name: file.name,
          file_size: file.size,
          category_id: selectedCategoryId || null,
          subject_id: selectedSubjectId || null,
        });

        if (insertError) throw insertError;
      } else {
        // Insert advertisement record
        const mediaType = file.type.startsWith("video/") ? "video" : "image";
        const { error: insertError } = await supabase.from("advertisements").insert({
          title,
          media_type: mediaType,
          media_url: fileUrl,
          link_url: linkUrl || null,
        });

        if (insertError) throw insertError;
      }

      toast({
        title: "Upload successful",
        description: `${type === "content" ? "Content" : "Advertisement"} has been uploaded`,
      });

      // Reset form
      setTitle("");
      setDescription("");
      setContentType("pdf");
      setLinkUrl("");
      setFile(null);
      setSelectedCategoryId("");
      setSelectedSubjectId("");
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setContentType("pdf");
    setLinkUrl("");
    setFile(null);
    setSelectedCategoryId("");
    setSelectedSubjectId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {type === "content" ? "Upload Content" : "Add Advertisement"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter title"
            />
          </div>

          {type === "content" && (
            <>
              <div className="space-y-2">
                <Label>Grade / Category *</Label>
                <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grade/category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {subjects.length > 0 && (
                <div className="space-y-2">
                  <Label>Subject (optional)</Label>
                  <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Content Type</Label>
                <Select value={contentType} onValueChange={setContentType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="timetable">Timetable</SelectItem>
                    <SelectItem value="weightage">Subject Weightage</SelectItem>
                    <SelectItem value="notes">Notes</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {type === "advertisement" && (
            <div className="space-y-2">
              <Label>Link URL (optional)</Label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                type="url"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>File</Label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept={
                type === "content"
                  ? ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.mp4"
                  : "image/*,video/*"
              }
              className="hidden"
            />

            {file ? (
              <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                {file.type.startsWith("image/") ? (
                  <Image className="h-8 w-8 text-primary" />
                ) : (
                  <FileText className="h-8 w-8 text-primary" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setFile(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Click to select a file
                  </span>
                </div>
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !file || !title.trim()}
            className="gradient-primary"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Uploading...
              </div>
            ) : (
              "Upload"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploadDialog;
