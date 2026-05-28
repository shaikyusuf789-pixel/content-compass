import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File, Trash2, Download, Loader2, Copy, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const Route = createFileRoute("/_dashboard/uploads")({
  component: UploadsPage,
});

function UploadsPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("user_uploads")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to fetch files");
      console.error(error);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    const file = selectedFiles[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `user_uploads/${fileName}`;

    try {
      // 1. Upload to Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Save to Database
      const { error: dbError } = await supabase.from("user_uploads").insert({
        file_name: file.name,
        file_path: filePath,
        file_type: file.type,
        file_size: file.size,
      });

      if (dbError) throw dbError;

      toast.success("File uploaded successfully");
      fetchFiles();
    } catch (error: any) {
      toast.error(error.message || "Upload failed");
      console.error(error);
    } finally {
      setUploading(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleDelete = async (file: any) => {
    try {
      // 1. Delete from Storage
      const { error: storageError } = await supabase.storage
        .from("uploads")
        .remove([file.file_path]);

      if (storageError) throw storageError;

      // 2. Delete from Database
      const { error: dbError } = await supabase
        .from("user_uploads")
        .delete()
        .eq("id", file.id);

      if (dbError) throw dbError;

      toast.success("File deleted");
      setFiles(files.filter((f) => f.id !== file.id));
    } catch (error: any) {
      toast.error(error.message || "Delete failed");
      console.error(error);
    }
  };

  const handleDownload = async (file: any) => {
    const { data, error } = await supabase.storage
      .from("uploads")
      .download(file.file_path);

    if (error) {
      toast.error("Download failed");
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.file_name;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Uploads</h1>
          <p className="text-muted-foreground">Manage your files and references</p>
        </div>
        <div className="relative">
          <Input
            type="file"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
            id="file-upload"
          />
          <Button asChild disabled={uploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload File
                </>
              )}
            </label>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-lg">
            <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No files uploaded yet</h3>
            <p className="text-muted-foreground">Upload your first file to see it here</p>
          </div>
        ) : (
          files.map((file) => (
            <Card key={file.id}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate max-w-[200px]">
                  {file.file_name}
                </CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-xs text-muted-foreground mb-4">
                  <p>{file.file_type}</p>
                  <p>{formatSize(file.file_size)}</p>
                  <p>{new Date(file.created_at).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(file)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
