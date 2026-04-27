import { apiRequest } from "@/api/http";

export type Role = "PARTICIPANT" | "ORGANIZER" | "ADMIN";

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  address: string | null;
  zone: string | null;
  avatar_url: string | null;
  onboarding_completed: boolean;
  role: Role;
  two_fa_enabled: boolean;
  is_active: boolean;
  created_at: string;
};

export type RegisterInput = {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type LoginRequires2faPayload = {
  requires_2fa: true;
  temp_token: string;
};

export type Verify2faInput = {
  temp_token: string;
  code: string;
};

export type Confirm2faInput = {
  code: string;
};

export async function register(input: RegisterInput) {
  return apiRequest<User, RegisterInput>({ method: "POST", path: "/auth/register", body: input });
}

export async function login(input: LoginInput) {
  return apiRequest<User | LoginRequires2faPayload, LoginInput>({
    method: "POST",
    path: "/auth/login",
    body: input,
  });
}

export async function verifyLogin2fa(input: Verify2faInput) {
  return apiRequest<User, Verify2faInput>({
    method: "POST",
    path: "/auth/login/verify-2fa",
    body: input,
  });
}

export async function refresh() {
  return apiRequest<null>({ method: "POST", path: "/auth/refresh" });
}

export async function logout() {
  return apiRequest<null>({ method: "POST", path: "/auth/logout" });
}

export async function me() {
  return apiRequest<User>({ method: "GET", path: "/auth/me" });
}

export async function enable2fa() {
  return apiRequest<null>({ method: "POST", path: "/auth/2fa/enable" });
}

export async function confirm2fa(input: Confirm2faInput) {
  return apiRequest<null, Confirm2faInput>({
    method: "POST",
    path: "/auth/2fa/confirm",
    body: input,
  });
}

export async function disable2fa() {
  return apiRequest<null>({ method: "POST", path: "/auth/2fa/disable" });
}
