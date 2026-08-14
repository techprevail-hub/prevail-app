// components/role-institute/ExportDataButton.tsx

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, Loader2, Check } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// ─── Types ──────────────────────────────────────────────────────────────────
interface ExportDataButtonProps {
  /** The data to export - array of objects */
  data: Record<string, any>[];
  /** Column configuration for mapping */
  columns: ExportColumn[];
  /** Filename without extension (default: 'export') */
  filename?: string;
  /** Button label (default: 'Export') */
  buttonLabel?: string;
  /** Button variant */
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon';
  /** Additional className for the button */
  className?: string;
  /** Show PDF option (default: true) */
  showPDF?: boolean;
  /** Show Excel (XLSX) option (default: true) */
  showExcel?: boolean;
  /** Called after successful export */
  onExport?: (format: 'xlsx' | 'pdf') => void;
  /** Title for the exported file */
  title?: string;
  /** Subtitle for the exported file */
  subtitle?: string;
}

interface ExportColumn {
  /** The key in the data object */
  key: string;
  /** Display header name */
  header: string;
  /** Optional formatter function */
  format?: (value: any, row?: Record<string, any>) => string;
  /** Width for PDF (in mm) */
  width?: number;
}

// ─── Component ─────────────────────────────────────────────────────────────
export const ExportDataButton: React.FC<ExportDataButtonProps> = ({
  data,
  columns,
  filename = 'export',
  buttonLabel = 'Export',
  variant = 'outline',
  size = 'default',
  className = '',
  showPDF = true,
  showExcel = true,
  onExport,
  title,
  subtitle,
}) => {
  // ─── State ──────────────────────────────────────────────────────────────
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState<'xlsx' | 'pdf' | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // ─── Helper Functions ──────────────────────────────────────────────────
  const getCellValue = (row: Record<string, any>, column: ExportColumn): string => {
    const value = row[column.key];
    if (column.format) {
      return column.format(value, row);
    }
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const getHeaders = (): string[] => {
    return columns.map(col => col.header);
  };

  const getRows = (): string[][] => {
    return data.map(row => {
      return columns.map(col => getCellValue(row, col));
    });
  };

  // ─── Get Column Widths for Excel ──────────────────────────────────────
  const getColumnWidths = (): number[] => {
    const headers = getHeaders();
    const rows = getRows();
    
    return columns.map((col, index) => {
      // Start with header width
      let maxLength = headers[index]?.length || 0;
      
      // Check all rows for max content length
      rows.forEach(row => {
        const cellValue = row[index] || '';
        const cellLength = String(cellValue).length;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      
      // Add some padding (minimum 10, maximum 50)
      return Math.max(Math.min(maxLength + 2, 50), 10);
    });
  };

  // ─── Export to XLSX (Excel format) ──────────────────────────────────────
  const exportToXLSX = () => {
    try {
      setExporting(true);
      setExportFormat('xlsx');

      const headers = getHeaders();
      const rows = getRows();
      const columnWidths = getColumnWidths();

      // Create workbook
      const wb = XLSX.utils.book_new();

      // Create data with title and subtitle
      const wsData: any[] = [];

      // Add title if provided
      if (title) {
        wsData.push([title]);
        wsData.push([]); // Empty row for spacing
      }

      // Add subtitle if provided
      if (subtitle) {
        wsData.push([subtitle]);
        wsData.push([]); // Empty row for spacing
      }

      // Add headers
      wsData.push(headers);

      // Add data rows
      rows.forEach(row => {
        wsData.push(row);
      });

      // Create worksheet
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = columnWidths.map(width => ({ wch: width }));

      // Merge title cells if title exists
      if (title) {
        const titleRowIndex = 0;
        ws['!merges'] = [
          { s: { r: titleRowIndex, c: 0 }, e: { r: titleRowIndex, c: headers.length - 1 } }
        ];
        // Style title (using xlsx-style or manual)
      }

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      // Generate Excel file
      const wbout = XLSX.write(wb, { 
        bookType: 'xlsx', 
        type: 'array',
        bookSST: false,
      });

      // Create blob and download
      const blob = new Blob([wbout], { type: 'application/octet-stream' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.xlsx`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setShowSuccess(true);
      toast.success('Excel file exported successfully!');
      onExport?.('xlsx');
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting XLSX:', error);
      toast.error('Failed to export Excel file');
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  // ─── Export to PDF ──────────────────────────────────────────────────────
  const exportToPDF = () => {
    try {
      setExporting(true);
      setExportFormat('pdf');

      const headers = getHeaders();
      const rows = getRows();

      // Create PDF document with landscape orientation
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      let startY = 20;

      // Add title if provided
      if (title) {
        doc.setFontSize(18);
        doc.setTextColor(44, 62, 80);
        doc.text(title, pageWidth / 2, startY, { align: 'center' });
        startY += 10;
      }

      // Add subtitle if provided
      if (subtitle) {
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text(subtitle, pageWidth / 2, startY, { align: 'center' });
        startY += 8;
      }

      // Add date
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, startY, { align: 'center' });
      startY += 8;

      // Calculate column widths with better algorithm
      const margin = 10;
      const availableWidth = pageWidth - (margin * 2);
      
      // Calculate ideal widths based on content
      const columnWidths = columns.map((col) => {
        if (col.width) return col.width;
        
        const headerLength = col.header.length;
        const maxDataLength = data.reduce((max, row) => {
          const val = getCellValue(row, col);
          return Math.max(max, String(val).length);
        }, 0);
        
        const contentWidth = Math.max(headerLength, maxDataLength) * 1.2 + 4;
        return Math.min(Math.max(contentWidth, 20), 80);
      });

      // Scale widths to fit page
      const totalWidth = columnWidths.reduce((sum, w) => sum + w, 0);
      const scaleFactor = Math.min(1, availableWidth / totalWidth);
      const finalWidths = columnWidths.map(w => Math.max(w * scaleFactor, 15));

      // Prepare table data
      const tableData = rows.map(row => row.map(cell => cell || ''));

      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: startY,
        margin: { left: margin, right: margin },
        columnStyles: finalWidths.reduce((acc: any, width, index) => {
          acc[index] = { 
            cellWidth: width,
            halign: 'left',
            valign: 'middle',
          };
          return acc;
        }, {}),
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: 'linebreak',
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          valign: 'middle',
        },
        headStyles: {
          fillColor: [108, 92, 231],
          textColor: [255, 255, 255],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          cellPadding: 2,
        },
        bodyStyles: {
          textColor: [51, 51, 51],
          fontSize: 7,
          cellPadding: 2,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        didParseCell: (data: any) => {
          if (data.section === 'head') {
            data.cell.styles.fontSize = 6.5;
          }
        },
        didDrawPage: (data: any) => {
          const pageNumber = data.pageNumber || 1;
          
          let totalPages = 1;
          if (data.settings && data.settings.totalPages) {
            totalPages = data.settings.totalPages;
          } else {
            const totalRows = tableData.length;
            const rowsPerPage = Math.floor((pageHeight - 50) / 8);
            totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage));
          }
          
          doc.setFontSize(7);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Page ${pageNumber} of ${totalPages}`,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
        },
      });

      // Save PDF
      doc.save(`${filename}.pdf`);

      setShowSuccess(true);
      toast.success('PDF exported successfully!');
      onExport?.('pdf');
      
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    } finally {
      setExporting(false);
      setExportFormat(null);
    }
  };

  // ─── Check if data is empty ────────────────────────────────────────────
  const isDataEmpty = !data || data.length === 0;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={className}
            disabled={isDataEmpty || exporting}
          >
            {exporting && exportFormat === 'xlsx' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : exporting && exportFormat === 'pdf' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {exporting ? 'Exporting...' : buttonLabel}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {showExcel && (
            <DropdownMenuItem onClick={exportToXLSX} disabled={isDataEmpty || exporting}>
              <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
              <span>Export to Excel</span>
              <span className="ml-auto text-xs text-muted-foreground">.xlsx</span>
            </DropdownMenuItem>
          )}
          {showPDF && (
            <DropdownMenuItem onClick={exportToPDF} disabled={isDataEmpty || exporting}>
              <FileText className="mr-2 h-4 w-4 text-rose-600" />
              <span>Export to PDF</span>
              <span className="ml-auto text-xs text-muted-foreground">.pdf</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* ─── Success Dialog ──────────────────────────────────────────────── */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center mt-2">Export Complete!</DialogTitle>
            <DialogDescription className="text-center">
              Your file has been exported successfully.
              {exportFormat === 'xlsx' && ' You can now open it in Microsoft Excel or Google Sheets.'}
              {exportFormat === 'pdf' && ' You can now view or share the PDF.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button onClick={() => setShowSuccess(false)} className="min-w-[100px]">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ExportDataButton;