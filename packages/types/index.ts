export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "revision"
  | "completed"
  | "cancelled";

export type UserRole =
  | "owner"
  | "admin"
  | "designer"
  | "finance"
  | "staff";

export type PaymentStatus =
  | "pending"
  | "verified"
  | "rejected";

export type PaymentType =
  | "dp"
  | "full";

export interface Order {
  id: string;
  order_code: string;
  customer_id: string;
  service_id: string | null;
  service_name: string;
  design_type: string | null;
  quantity: number;
  brief: string | null;
  notes: string | null;
  total_amount: number;
  dp_amount: number;
  remaining_amount: number;
  status: OrderStatus;
  deadline: string | null;
  assigned_admin: string | null;
  created_at: string;
  updated_at: string;
}
