import QRCode from 'qrcode';

/**
 * Generate a QR code for report verification
 * @param reportId - The unique report identifier
 * @param reportReferenceId - The human-readable report reference (e.g., REP-2026-8801)
 * @param baseUrl - The base URL for verification (defaults to current domain)
 * @returns Promise<string> - Data URL of the QR code image
 */
export async function generateReportQRCode(
  reportId: string,
  reportReferenceId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
): Promise<string> {
  // Create verification URL
  const verificationUrl = `${baseUrl}/verify-report/${reportReferenceId}`;
  
  try {
    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'M', // Medium error correction
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate a verification URL for a report
 * @param reportReferenceId - The human-readable report reference
 * @param baseUrl - The base URL for verification
 * @returns The complete verification URL
 */
export function getVerificationUrl(
  reportReferenceId: string,
  baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
): string {
  return `${baseUrl}/verify-report/${reportReferenceId}`;
}

/**
 * Validate a report reference ID format
 * @param reportReferenceId - The report reference to validate
 * @returns True if the format is valid
 */
export function isValidReportReference(reportReferenceId: string): boolean {
  // Format: REP-YYYY-NNNN (e.g., REP-2026-8801)
  const regex = /^REP-\d{4}-\d{4}$/;
  return regex.test(reportReferenceId);
}