export type LoanCustomer = {
  id: string;
  fileNumber: number;
  fullName: string;
  documentType: string;
  documentNumber: string;
  taxId: string;
  birthDate: string;
  phone: string;
  email: string;
  address: string;
  employmentNotes: string;
  privateNotes: string;
  active: boolean;
  createdAt: string;
};

export type LoanRecord = {
  id: string;
  loanNumber: number;
  customerId: string;
  customerName: string;
  principal: number;
  interestRate: number;
  totalAmount: number;
  installmentCount: number;
  frequency: "weekly" | "biweekly" | "monthly";
  firstDueDate: string;
  status: "draft" | "active" | "paid" | "overdue" | "cancelled" | "written_off";
  notes: string;
  createdAt: string;
};

export type InstallmentRecord = {
  id: string;
  loanId: string;
  loanNumber: number;
  installmentNumber: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  dueDate: string;
  amount: number;
  paidAmount: number;
  balance: number;
  status: "pending" | "partial" | "paid" | "overdue" | "cancelled";
};

export type PaymentRecord = {
  id: string;
  loanId: string;
  installmentId: string;
  loanNumber: number;
  customerName: string;
  amount: number;
  paidAt: string;
  method: "cash" | "transfer" | "other";
  reference: string;
  notes: string;
};

export const formatMoney = (value: number) => new Intl.NumberFormat("es-AR", {
  style: "currency", currency: "ARS", maximumFractionDigits: 0,
}).format(value);

export const formatDate = (value: string) => value
  ? new Intl.DateTimeFormat("es-AR", { timeZone: "UTC" }).format(new Date(`${value.slice(0, 10)}T00:00:00Z`))
  : "—";
