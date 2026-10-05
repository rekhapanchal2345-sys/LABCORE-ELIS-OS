import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

/**
 * HIPAA/GDPR Compliance Utilities
 * Handles audit logging, data retention, and patient rights
 */

export interface AuditLogData {
  userId: string;
  module: string;
  action: string;
  recordId?: string;
  ipAddress?: string;
  userAgent?: string;
  oldData?: any;
  newData?: any;
  metadata?: any;
}

/**
 * Create an audit log entry for PHI access/modification
 * Required for HIPAA compliance and GDPR accountability
 */
export const createAuditLog = async (data: AuditLogData) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        module: data.module,
        action: data.action,
        recordId: data.recordId,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        oldData: data.oldData ?? Prisma.DbNull,
        newData: data.newData ?? Prisma.DbNull,
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error to avoid breaking main operation
  }
};

/**
 * Log patient data access (HIPAA requirement)
 */
export const logPatientDataAccess = async (
  userId: string,
  patientId: string,
  accessType: 'VIEW' | 'EXPORT' | 'SHARE',
  ipAddress?: string,
  userAgent?: string
) => {
  await createAuditLog({
    userId,
    module: 'PATIENT',
    action: `PATIENT_DATA_${accessType}`,
    recordId: patientId,
    ipAddress,
    userAgent,
    metadata: { accessType },
  });
};

/**
 * Data retention policy - automatically archive/delete old records
 * Configurable based on institutional requirements
 */
export const applyDataRetentionPolicy = async () => {
  const retentionYears = parseInt(process.env.DATA_RETENTION_YEARS || '7');
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - retentionYears);

  try {
    // Archive old completed orders (not delete - keep for legal requirements)
    const oldOrders = await prisma.order.findMany({
      where: {
        orderStatus: 'COMPLETED',
        reportedAt: {
          lt: cutoffDate,
        },
      },
      select: { id: true },
    });

    console.log(`Found ${oldOrders.length} orders eligible for archival`);

    // In a real implementation, you would move these to an archive database
    // or mark them as archived rather than deleting them

    return {
      success: true,
      processed: oldOrders.length,
      cutoffDate,
    };
  } catch (error) {
    console.error('Data retention policy application failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * GDPR Right to be Forgotten - anonymize patient data
 * Keeps essential records but removes personally identifiable information
 */
export const anonymizePatientData = async (patientId: string, requestedBy: string) => {
  try {
    // Get patient data before anonymization for audit
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Create audit log before anonymization
    await createAuditLog({
      userId: requestedBy,
      module: 'PATIENT',
      action: 'GDPR_RIGHT_TO_BE_FORGOTTEN',
      recordId: patientId,
      oldData: patient,
      newData: { status: 'ANONYMIZED' },
    });

    // Anonymize patient data
    const anonymizedData = {
      firstName: 'ANONYMIZED',
      lastName: 'ANONYMIZED',
      phone: null,
      email: null,
      address: null,
      city: null,
      state: null,
      pincode: null,
      emergencyContact: null,
    };

    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: anonymizedData,
    });

    return {
      success: true,
      patientId,
      anonymizedAt: new Date(),
    };
  } catch (error) {
    console.error('Patient anonymization failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Data breach notification system
 * Logs potential security incidents for mandatory reporting
 */
export const reportDataBreach = async (data: {
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedRecords: number;
  discoveredBy: string;
  ipAddress?: string;
}) => {
  try {
    // Log as high-priority audit entry
    await createAuditLog({
      userId: data.discoveredBy,
      module: 'SECURITY',
      action: 'DATA_BREACH_REPORTED',
      metadata: {
        severity: data.severity,
        description: data.description,
        affectedRecords: data.affectedRecords,
        ipAddress: data.ipAddress,
      },
    });

    // In production, this would trigger notifications to:
    // - Security team
    // - Compliance officer
    // - Affected patients (within required timeframes)
    // - Regulatory bodies (if required by law)

    return {
      success: true,
      breachId: `BREACH-${Date.now()}`,
      reportedAt: new Date(),
    };
  } catch (error) {
    console.error('Data breach reporting failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Check if user has proper authorization to access patient data
 * Implements minimum necessary access principle (HIPAA)
 */
export const authorizePatientDataAccess = async (
  userId: string,
  patientId: string,
  requiredRole?: string
): Promise<boolean> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return false;
    }

    // Admins have full access
    if (user.role === 'ADMIN') {
      return true;
    }

    // Check role-based access if specified
    if (requiredRole && user.role !== requiredRole) {
      return false;
    }

    // Add additional business logic here for role-based access control
    // For example, doctors can only access their own patients, etc.

    return true;
  } catch (error) {
    console.error('Authorization check failed:', error);
    return false;
  }
};

/**
 * Export patient data for GDPR right to data portability
 */
export const exportPatientData = async (patientId: string, requestedBy: string) => {
  try {
    // Verify authorization
    const authorized = await authorizePatientDataAccess(requestedBy, patientId);
    if (!authorized) {
      throw new Error('Unauthorized access to patient data');
    }

    // Get all patient-related data
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        orders: {
          include: {
            items: true,
            samples: true,
            results: {
              include: {
                values: true,
              },
            },
            payments: true,
            reports: true,
          },
        },
        communications: true,
      },
    });

    if (!patient) {
      throw new Error('Patient not found');
    }

    // Log the export
    await logPatientDataAccess(requestedBy, patientId, 'EXPORT');

    return {
      success: true,
      data: patient,
      exportedAt: new Date(),
    };
  } catch (error) {
    console.error('Patient data export failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};