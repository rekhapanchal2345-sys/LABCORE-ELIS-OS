"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import DashboardLayout from "@/components/layout/dashboardlayout";
import InvoiceDetails from "@/components/invoices/InvoiceDetails";
import ProfessionalInvoice from "@/components/invoices/ProfessionalInvoice";
import LuxuryGSTInvoice from "@/components/invoices/LuxuryGSTInvoice";
import { invoiceApi } from "@/lib/api";
import type { Invoice } from "@/components/invoices/InvoiceTable";

interface InvoiceItem {
  id: string | number;
  testName?: string;
  testCode?: string;
  quantity?: number;
  unitPrice?: number;
  discount?: number;
  amount?: number;
}

interface FullInvoiceData extends Invoice {
  items?: InvoiceItem[];
  taxAmount?: number;
  discountAmount?: number;
  notes?: string;
  patientInfo?: {
    age?: string;
    gender?: string;
    phone?: string;
    address?: string;
    email?: string;
  };
  doctorInfo?: {
    name?: string;
    qualification?: string;
    gstin?: string;
    address?: string;
  };
  payments?: Array<{
    amount: number;
    method: string;
    transactionId?: string;
    paidAt: string;
  }>;
}

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [invoice, setInvoice] = useState<FullInvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoPrint, setAutoPrint] = useState(false);
  const [autoDownload, setAutoDownload] = useState(false);

  useEffect(() => {
    async function fetchInvoice() {
      try {
        setLoading(true);
        const response = await invoiceApi.getById(params.id as string);
        
        if (response.success && response.data) {
          const data = response.data as any;
          
          // Calculate patient age
          let age = "";
          if (data.order?.patient?.dateOfBirth) {
            const dob = new Date(data.order.patient.dateOfBirth);
            const today = new Date();
            const years = today.getFullYear() - dob.getFullYear();
            const months = today.getMonth() - dob.getMonth();
            age = `${years} years ${months >= 0 ? months : 12 + months} months`;
          }
          
          // Transform API data to match component interface
          const transformedInvoice: FullInvoiceData = {
            id: data.id,
            invoiceNumber: data.invoiceNumber,
            patientId: data.order?.patient?.id,
            patientName: data.order?.patient 
              ? `${data.order.patient.firstName} ${data.order.patient.lastName}`
              : undefined,
            patientUhid: data.order?.patient?.uhid,
            orderId: data.orderId,
            orderNumber: data.order?.orderNumber,
            totalAmount: Number(data.grandTotal),
            paidAmount: data.order?.payments
              ? data.order.payments
                  .filter((p: any) => p.status === "PAID")
                  .reduce((sum: number, p: any) => sum + Number(p.amount), 0)
              : 0,
            pendingAmount: data.pendingAmount,
            status: data.paymentStatus,
            paymentStatus: data.paymentStatus,
            createdAt: data.createdAt,
            dueDate: data.dueDate,
            
            // Patient info
            patientInfo: {
              age: age || undefined,
              gender: data.order?.patient?.gender,
              phone: data.order?.patient?.phone,
              email: data.order?.patient?.email,
              address: data.order?.patient?.address ? 
                `${data.order.patient.address}, ${data.order.patient.city || ""}, ${data.order.patient.state || ""} ${data.order.patient.pincode || ""}` 
                : undefined,
            },
            
            // Doctor info
            doctorInfo: {
              name: data.order?.doctor?.fullName,
              qualification: data.order?.doctor?.qualification,
              gstin: data.order?.doctor?.gstin,
              address: data.order?.doctor?.address,
            },
            
            // Items from order items
            items: data.order?.items?.map((item: any) => ({
              id: item.id,
              testName: item.test?.testName,
              testCode: item.test?.testCode,
              quantity: 1,
              unitPrice: Number(item.price),
              discount: Number(item.discount),
              amount: Number(item.finalPrice),
            })),
            
            // Tax and discount
            taxAmount: Number(data.gstAmount),
            discountAmount: Number(data.discount),
            
            // Notes
            notes: data.order?.notes,
            
            // Payments
            payments: data.order?.payments
              ?.filter((p: any) => p.status === "PAID")
              .map((p: any) => ({
                amount: Number(p.amount),
                method: p.method,
                transactionId: p.transactionId,
                paidAt: p.paidAt,
              })),
          };
          
          setInvoice(transformedInvoice);
          
          // Handle auto print/download
          if (searchParams.get('print') === 'true') {
            setAutoPrint(true);
          }
          if (searchParams.get('download') === 'true') {
            setAutoDownload(true);
          }
        } else {
          setError("Failed to load invoice");
        }
      } catch (err) {
        console.error("Error fetching invoice:", err);
        setError("Failed to load invoice. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchInvoice();
    }
  }, [params.id, searchParams]);

  const handleEdit = () => {
    router.push(`/invoices/${params.id}?edit=true`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) {
      return;
    }

    try {
      await invoiceApi.delete(params.id as string);
      router.push("/invoices");
    } catch (err) {
      console.error("Error deleting invoice:", err);
      alert("Failed to delete invoice");
    }
  };

  const handleRecordPayment = () => {
    router.push(`/payments?orderId=${invoice?.orderId}`);
  };

  if (loading) {
    return (
      <DashboardLayout title="Invoice Details">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
            <p className="text-sm text-gray-500">Loading invoice...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !invoice) {
    return (
      <DashboardLayout title="Invoice Details">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="mx-auto mb-4 text-4xl">⚠️</div>
          <h2 className="mb-2 text-lg font-semibold text-red-900">
            {error || "Invoice not found"}
          </h2>
          <p className="mb-4 text-sm text-red-700">
            The invoice you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <button
            onClick={() => router.push("/invoices")}
            className="rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-800"
          >
            Back to Invoices
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Auto-load professional view for print/download
  if (autoPrint || autoDownload) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <ProfessionalInvoice
            invoice={invoice}
            items={invoice.items}
            taxAmount={invoice.taxAmount}
            discountAmount={invoice.discountAmount}
            notes={invoice.notes}
            patientInfo={invoice.patientInfo}
            doctorInfo={invoice.doctorInfo}
            payments={invoice.payments}
          />
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout title={`Invoice ${invoice.invoiceNumber}`}>
      <InvoiceDetails
        invoice={invoice}
        items={invoice.items}
        taxAmount={invoice.taxAmount}
        discountAmount={invoice.discountAmount}
        notes={invoice.notes}
        patientInfo={invoice.patientInfo}
        doctorInfo={invoice.doctorInfo}
        payments={invoice.payments}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRecordPayment={handleRecordPayment}
      />
    </DashboardLayout>
  );
}