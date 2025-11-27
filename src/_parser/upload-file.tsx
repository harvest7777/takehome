import { useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { parseInputJson, jsonStringSubmission } from "./parser-helpers";

export function UploadFileButton() {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      await parseInputJson(jsonStringSubmission);
      setOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(
        `Failed to upload: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Upload Submissions</DialogTitle>
          <DialogDescription>
            Review the JSON data below and click Upload to parse and store it.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[400px] text-sm">
            {jsonStringSubmission}
          </pre>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={isUploading}>
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
