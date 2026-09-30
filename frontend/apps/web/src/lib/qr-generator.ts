import QRCode from 'qrcode';

/**
 * QR Code Generation Utility for Premium Report Features
 * Handles QR code generation for report verification and sharing
 */

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generate a verification QR code for a report
 * @param reportId The ID of the report
 * @param baseUrl The base URL for the verification endpoint
 * @param options Optional QR code generation options
 * @returns Promise<string> The QR code as a data URL
 */
export async function generateVerificationQRCode(
  reportId: string,
  baseUrl: string = window.location.origin,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const verificationUrl = `${baseUrl}/verify-report/${reportId}`;
    
    const qrCodeOptions: QRCode.QRCodeToDataURLOptions = {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    };
    
    const qrCodeDataURL = await QRCode.toDataURL(verificationUrl, qrCodeOptions);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating verification QR code:', error);
    throw new Error('Failed to generate verification QR code');
  }
}

/**
 * Generate a QR code for a shareable link
 * @param shareUrl The shareable URL
 * @param options Optional QR code generation options
 * @returns Promise<string> The QR code as a data URL
 */
export async function generateShareLinkQRCode(
  shareUrl: string,
  options: QRCodeOptions = {}
): Promise<string> {
  try {
    const qrCodeOptions: QRCode.QRCodeToDataURLOptions = {
      width: options.width || 300,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    };
    
    const qrCodeDataURL = await QRCode.toDataURL(shareUrl, qrCodeOptions);
    
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating share link QR code:', error);
    throw new Error('Failed to generate share link QR code');
  }
}

/**
 * Download a QR code as an image file
 * @param reportId The ID of the report
 * @param filename The filename for the downloaded QR code
 * @param baseUrl The base URL for the verification endpoint
 * @param options Optional QR code generation options
 */
export async function downloadQRCode(
  reportId: string,
  filename: string,
  baseUrl: string = window.location.origin,
  options: QRCodeOptions = {}
): Promise<void> {
  try {
    const qrCodeDataURL = await generateVerificationQRCode(reportId, baseUrl, options);
    
    // Create a link to download the QR code
    const link = document.createElement('a');
    link.href = qrCodeDataURL;
    link.download = filename || `qr-code-${reportId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading QR code:', error);
    throw new Error('Failed to download QR code');
  }
}

/**
 * Generate a QR code and return it as a Blob
 * @param reportId The ID of the report
 * @param baseUrl The base URL for the verification endpoint
 * @param options Optional QR code generation options
 * @returns Promise<Blob> The QR code as a Blob
 */
export async function generateQRCodeBlob(
  reportId: string,
  baseUrl: string = window.location.origin,
  options: QRCodeOptions = {}
): Promise<Blob> {
  try {
    const qrCodeDataURL = await generateVerificationQRCode(reportId, baseUrl, options);
    
    // Convert data URL to Blob
    const response = await fetch(qrCodeDataURL);
    const blob = await response.blob();
    
    return blob;
  } catch (error) {
    console.error('Error generating QR code blob:', error);
    throw new Error('Failed to generate QR code blob');
  }
}

/**
 * Validate a QR code URL
 * @param url The URL to validate
 * @returns boolean Whether the URL is valid
 */
export function validateQRCodeURL(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Extract report ID from a verification URL
 * @param url The verification URL
 * @returns string | null The report ID or null if invalid
 */
export function extractReportIdFromURL(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const pathParts = parsedUrl.pathname.split('/');
    const reportIdIndex = pathParts.indexOf('verify-report');
    
    if (reportIdIndex !== -1 && reportIdIndex + 1 < pathParts.length) {
      return pathParts[reportIdIndex + 1];
    }
    
    return null;
  } catch {
    return null;
  }
}