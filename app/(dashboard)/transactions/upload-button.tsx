"use client";

import { useRef } from "react";
import { Upload, FileText } from "lucide-react";
import { useCSVReader } from "react-papaparse";

import { autoDetectCardFromFilename, type CreditCard } from "@/lib/cashback";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

type Props = {
  onUpload: (results: any, card?: CreditCard | null) => void;
};

export const UploadButton = ({ onUpload }: Props) => {
  const { CSVReader } = useCSVReader();
  const pdfInputRef = useRef<HTMLInputElement>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const detectedCard = autoDetectCardFromFilename(file.name);

    try {
      // Dynamically import pdfjs-dist to keep bundle small
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      let fullText = "";
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      // Try to parse lines as CSV-like rows: Date | Payee | Amount
      const lines = fullText
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      // Simple heuristic: look for lines with a number that looks like an amount
      const amountRegex = /[-+]?\d{1,3}(,\d{3})*(\.\d{1,2})?/;
      const dateRegex = /\d{1,2}[/-]\d{1,2}[/-]\d{2,4}/;

      const rows: string[][] = [];
      for (const line of lines) {
        if (dateRegex.test(line) && amountRegex.test(line)) {
          // Split on multiple spaces or common separators
          const parts = line.split(/\s{2,}|\t/).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2) {
            rows.push(parts);
          }
        }
      }

      if (rows.length === 0) {
        // Fallback: show raw text as single column for user to review
        const rawRows = lines.slice(0, 50).map((l) => [l]);
        onUpload(
          { data: [["Raw Text"], ...rawRows], errors: [], meta: {} },
          detectedCard,
        );
        return;
      }

      // Add a header row
      const maxCols = Math.max(...rows.map((r) => r.length));
      const header = Array.from({ length: maxCols }, (_, i) =>
        i === 0 ? "date" : i === maxCols - 1 ? "amount" : `col_${i}`
      );

      onUpload({ data: [header, ...rows], errors: [], meta: {} }, detectedCard);
    } catch (err) {
      console.error("PDF parse error:", err);
      // If pdfjs-dist is not installed, show helpful message
      onUpload({ data: [["error"], ["Could not parse PDF. Please convert to CSV and re-upload."]], errors: [], meta: {} }, detectedCard);
    }

    // Reset input so same file can be re-uploaded
    e.target.value = "";
  };

  return (
    <>
      <input
        ref={pdfInputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handlePdfUpload}
      />
      <CSVReader
        onUploadAccepted={(results: any, file?: File) => {
          const detectedCard = file ? autoDetectCardFromFilename(file.name) : null;
          onUpload(results, detectedCard);
        }}
      >
        {({ getRootProps, acceptedFile }: any) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="w-full lg:w-auto">
                <Upload className="size-4 mr-2" />
                Import
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-xs text-muted-foreground">
                Choose file format
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem {...getRootProps()} className="cursor-pointer">
                <Upload className="size-4 mr-2 text-emerald-600" />
                Upload CSV / Excel
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => pdfInputRef.current?.click()}
              >
                <FileText className="size-4 mr-2 text-rose-500" />
                Upload PDF Statement
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CSVReader>
    </>
  );
};

