import "server-only";

import { createAdminSupabaseClient } from "@/lib/supabase/clients";
import { isSupabaseAdminConfigured } from "@/lib/supabase/config";
import type { InstallmentRecord, LoanCustomer, LoanRecord, PaymentRecord } from "@/lib/finance-shared";

export type FinanceWorkspace = {
  customers: LoanCustomer[];
  loans: LoanRecord[];
  installments: InstallmentRecord[];
  payments: PaymentRecord[];
  configured: boolean;
  issue?: string;
};

const emptyWorkspace = (configured: boolean, issue?: string): FinanceWorkspace => ({
  customers: [], loans: [], installments: [], payments: [], configured, issue,
});

export async function getFinanceWorkspace(): Promise<FinanceWorkspace> {
  if (!isSupabaseAdminConfigured()) {
    return emptyWorkspace(false, "Completá las claves de Supabase y ejecutá los SQL del proyecto.");
  }

  try {
    const supabase = createAdminSupabaseClient();
    const [customerResult, loanResult, installmentResult, paymentResult] = await Promise.all([
      supabase.from("loan_customers").select("*").is("archived_at", null).order("full_name"),
      supabase.from("loans").select("*").order("created_at", { ascending: false }).limit(500),
      supabase.from("loan_installments").select("*").order("due_date", { ascending: true }).limit(1000),
      supabase.from("loan_payments").select("*").order("paid_at", { ascending: false }).limit(500),
    ]);
    const firstError = customerResult.error ?? loanResult.error ?? installmentResult.error ?? paymentResult.error;
    if (firstError) throw new Error(firstError.message);

    const customers = (customerResult.data ?? []).map((row) => ({
      id: String(row.id), fileNumber: Number(row.file_number), fullName: String(row.full_name),
      documentType: String(row.document_type), documentNumber: String(row.document_number),
      taxId: String(row.tax_id ?? ""), birthDate: String(row.birth_date ?? ""), phone: String(row.phone),
      email: String(row.email ?? ""), address: String(row.address), employmentNotes: String(row.employment_notes ?? ""),
      privateNotes: String(row.private_notes ?? ""), active: Boolean(row.active), createdAt: String(row.created_at),
    }));
    const customerById = new Map(customers.map((customer) => [customer.id, customer]));

    const loans = (loanResult.data ?? []).map((row) => ({
      id: String(row.id), loanNumber: Number(row.loan_number), customerId: String(row.customer_id),
      customerName: customerById.get(String(row.customer_id))?.fullName ?? "Cliente archivado",
      principal: Number(row.principal), interestRate: Number(row.interest_rate), totalAmount: Number(row.total_amount),
      installmentCount: Number(row.installment_count), frequency: row.frequency as LoanRecord["frequency"],
      firstDueDate: String(row.first_due_date), status: row.status as LoanRecord["status"],
      notes: String(row.notes ?? ""), createdAt: String(row.created_at),
    }));
    const loanById = new Map(loans.map((loan) => [loan.id, loan]));

    const installments = (installmentResult.data ?? []).map((row) => {
      const loan = loanById.get(String(row.loan_id));
      const customer = loan ? customerById.get(loan.customerId) : undefined;
      const amount = Number(row.amount);
      const paidAmount = Number(row.paid_amount);
      const overdue = ["pending", "partial", "overdue"].includes(String(row.status)) && String(row.due_date) < today();
      return {
        id: String(row.id), loanId: String(row.loan_id), loanNumber: loan?.loanNumber ?? 0,
        installmentNumber: Number(row.installment_number), customerId: loan?.customerId ?? "",
        customerName: customer?.fullName ?? "Cliente archivado", customerPhone: customer?.phone ?? "",
        dueDate: String(row.due_date), amount, paidAmount, balance: Math.max(0, amount - paidAmount),
        status: (overdue ? "overdue" : row.status) as InstallmentRecord["status"],
      };
    });

    const payments = (paymentResult.data ?? []).map((row) => {
      const loan = loanById.get(String(row.loan_id));
      return {
        id: String(row.id), loanId: String(row.loan_id), installmentId: String(row.installment_id ?? ""),
        loanNumber: loan?.loanNumber ?? 0, customerName: loan?.customerName ?? "Cliente archivado",
        amount: Number(row.amount), paidAt: String(row.paid_at), method: row.method as PaymentRecord["method"],
        reference: String(row.reference ?? ""), notes: String(row.notes ?? ""),
      };
    });

    return { customers, loans, installments, payments, configured: true };
  } catch (error) {
    return emptyWorkspace(true, error instanceof Error ? `Supabase respondió: ${error.message}` : "No se pudo leer la base financiera.");
  }
}

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(new Date());
}
