import { jsPDF } from 'jspdf';
import { PDFDocument } from 'pdf-lib';
import { formatPatientFullName } from './patient-utils';

export interface PDFOperationOptions {
  password?: string;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

function toUint8Array(buffer: ArrayBuffer | Uint8Array): Uint8Array {
  if (buffer instanceof Uint8Array) return buffer;
  return new Uint8Array(buffer);
}

export async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  return await blob.arrayBuffer();
}

export async function bytesToBlob(bytes: Uint8Array): Promise<Blob> {
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}

/**
 * Merge multiple PDF buffers into a single PDF using pdf-lib.
 * Each source document's pages are copied into a fresh merged document.
 * Optional password protection can be applied at the same time.
 */
export async function mergePDFs(
  pdfBuffers: ArrayBuffer[],
  options: PDFOperationOptions = {}
): Promise<Blob> {
  try {
    const mergedPdf = await PDFDocument.create();

    for (const buffer of pdfBuffers) {
      const src = await PDFDocument.load(toUint8Array(buffer), {
        ignoreEncryption: true,
      });
      const pages = await mergedPdf.copyPages(src, src.getPageIndices());
      pages.forEach((page) => mergedPdf.addPage(page));
    }

    if (options.metadata) {
      mergedPdf.setTitle(options.metadata.title || 'Merged Report');
      mergedPdf.setAuthor(options.metadata.author || 'LabCore ELIS');
      mergedPdf.setSubject(options.metadata.subject || 'Laboratory Report');
      mergedPdf.setKeywords((options.metadata.keywords || 'medical,report,laboratory').split(','));
    }

    const bytes = options.password
      ? await (mergedPdf as any).save({
          userPassword: options.password,
          ownerPassword: options.password,
        })
      : await mergedPdf.save();

    return await bytesToBlob(bytes);
  } catch (error) {
    console.error('Error merging PDFs:', error);
    throw new Error('Failed to merge PDFs');
  }
}

/**
 * Add password protection to an existing PDF using pdf-lib encryption.
 * Reloads the given buffer, re-saves with AES user/owner passwords.
 */
export async function protectPDF(
  pdfBuffer: ArrayBuffer | Uint8Array,
  password: string
): Promise<Blob> {
  try {
    const pdf = await PDFDocument.load(toUint8Array(pdfBuffer), {
      ignoreEncryption: true,
    });

    const bytes = await (pdf as any).save({
      userPassword: password,
      ownerPassword: password,
      permissions: {
        printing: 'highResolution',
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    });

    return await bytesToBlob(bytes);
  } catch (error) {
    console.error('Error protecting PDF:', error);
    throw new Error('Failed to protect PDF');
  }
}
/**
 * Generate a laboratory report PDF from report data using jsPDF.
 * Includes patient info, test results, reference ranges and flags.
 */
export async function generateReportPDF(
  reportData: any,
  options: PDFOperationOptions = {}
): Promise<Blob> {
  try {
    const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 40;

    if (options.metadata) {
      pdf.setProperties({
        title: options.metadata.title || 'Laboratory Report',
        author: options.metadata.author || 'LabCore ELIS',
        subject: options.metadata.subject || 'Medical Laboratory Report',
        keywords: options.metadata.keywords || 'medical,report,laboratory',
      });
    }

    const patient = reportData.patient || reportData.order?.patient || {};
    const order = reportData.order || {};
    const test = reportData.test || {};
    const results = reportData.values || reportData.results || [];
    const reportRef =
      reportData.reportReferenceId ||
      reportData.reportNumber ||
      'REP-' + (order.orderNumber || 'XXXX');

    // ---- Header band ----
    pdf.setFillColor(9, 9, 45);
    pdf.rect(0, 0, pageWidth, 90, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text('LabCore ELIS', margin, 40);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(180, 220, 255);
    pdf.text('Laboratory Diagnostic Report', margin, 60);

    // ---- Body ----
    let y = 120;
    pdf.setTextColor(33, 33, 33);
    pdf.setFontSize(10);

    const line = (x: number, yy: number, label: string, value: string) => {
      pdf.setFont('helvetica', 'bold');
      pdf.text(label, x, yy);
      pdf.setFont('helvetica', 'normal');
      pdf.text(value, x + 150, yy, { maxWidth: pageWidth - margin - x - 150 });
    };

    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Patient Information', margin, y);
    y += 18;
    pdf.setFontSize(10);
    line(margin, y, 'Name:', formatPatientFullName(patient) || '-');
    y += 18;
    line(margin, y, 'UHID:', patient.uhid || '-');
    y += 18;
    line(margin, y, 'Order No:', order.orderNumber || '-');
    y += 18;
    line(margin, y, 'Report Ref:', reportRef);
    y += 18;
    line(margin, y, 'Reported:', reportData.publishedAt ? new Date(reportData.publishedAt).toLocaleString() : '-');

    y += 24;
    pdf.setDrawColor(200, 200, 200);
    pdf.line(margin, y, pageWidth - margin, y);

    y += 18;
    pdf.setFontSize(13);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(9, 9, 29);
    pdf.text('Test: ' + (test.testName || '-'), margin, y);
    y += 14;
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(120, 120, 120);
    pdf.text((test.testCode || '') + ' | ' + (test.sampleType || 'Sample'), margin, y);

    y += 20;

    // Results table header
    pdf.setFillColor(245, 247, 252);
    pdf.rect(margin, y, pageWidth - margin * 2, 22, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(70, 70, 90);
    pdf.text('Parameter', margin + 10, y + 15);
    pdf.text('Result', 220, y + 15);
    pdf.text('Units', 320, y + 15);
    pdf.text('Reference Range', 390, y + 15);
    pdf.text('Flag', 520, y + 15);
    y += 22;

    pdf.setFont('helvetica', 'normal');
    const rowItems =
      Array.isArray(results) && results.length
        ? results.flatMap((r: any) => r.values || [])
        : [];

    if (rowItems.length === 0) {
      pdf.setTextColor(150, 150, 150);
      pdf.text('No result values available for this report.', margin + 10, y);
    } else {
      rowItems.forEach((v: any) => {
        const param = v.parameter || {};
        const unit = param.unit || '';
        const rangeObj = param.referenceRanges && param.referenceRanges[0] ? param.referenceRanges[0] : {};
        const range = rangeObj.rangeText || '';
        const flag = v.flag || '';
        pdf.setTextColor(33, 33, 33);
        pdf.text(String(param.name || '-'), margin + 10, y);
        pdf.text(String(v.value ?? '-'), 220, y);
        pdf.text(unit, 320, y);
        pdf.text(range, 390, y, { maxWidth: 110 });
        const flagColors: Record<string, [number, number, number]> = {
          HIGH: [220, 38, 38],
          LOW: [220, 38, 38],
          CRITICAL: [180, 30, 30],
          ABNORMAL: [234, 88, 12],
          NORMAL: [22, 163, 74],
        };
        if (flag && flagColors[flag.toUpperCase()]) {
          pdf.setTextColor(...(flagColors[flag.toUpperCase()] as [number, number, number]));
        }
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(flag || '-'), 520, y);
        pdf.setFont('helvetica', 'normal');
        y += 20;
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = 60;
        }
      });
    }
    // Clinical interpretation
    const interpretation =
      reportData.interpretation || reportData.clinicalInterpretation;
    if (interpretation) {
      y += 12;
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(9, 9, 29);
      pdf.text('Clinical Interpretation', margin, y);
      y += 14;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(80, 80, 90);
      const yLines = pdf.splitTextToSize(interpretation, pageWidth - margin * 2);
      pdf.text(yLines, margin, y);
      y += yLines.length * 12;
    }

    // Signature block
    if (y + 90 < pageHeight) {
      y += 30;
      const signed =
        (reportData.reportData && reportData.reportData.digitalSignature) ||
        reportData.approvedBy;
      pdf.setDrawColor(120, 120, 120);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(60, 60, 70);
      pdf.setFontSize(9);
      pdf.text('Authorized By', margin, y);
      y += 22;
      pdf.line(margin, y, 220, y);
      if (signed) {
        const signName =
          signed.appliedBy || (reportData.approvedBy && reportData.approvedBy.fullName) || 'System';
        pdf.text(signName, margin + 6, y + 2);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(140, 140, 140);
        pdf.setFontSize(7.5);
        pdf.text('Digital sign-off', margin + 6, y + 12);
      }
    }

    // Footer on all pages
    const pages = pdf.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      pdf.setPage(i);
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 160);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        reportRef + ' | Generated by LabCore ELIS | ' + new Date().toLocaleDateString(),
        pageWidth / 2,
        pageHeight - 24,
        { align: 'center' }
      );
    }

    const pdfBlob = await pdf.output('blob');

    if (options.password) {
      const arr = await blobToArrayBuffer(pdfBlob);
      return await protectPDF(arr, options.password);
    }

    return pdfBlob;
  } catch (error) {
    console.error('Error generating report PDF:', error);
    throw new Error('Failed to generate report PDF');
  }
}

/** Download a PDF blob to the user's device. */
export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Open a PDF blob in a new tab. */
export function openPDFInNewTab(pdfBlob: Blob): void {
  const url = URL.createObjectURL(pdfBlob);
  window.open(url, '_blank');
  URL.revokeObjectURL(url);
}
