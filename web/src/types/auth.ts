export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: "customer" | "seller" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}
