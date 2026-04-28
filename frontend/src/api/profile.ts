import { apiRequest } from "@/api/http";

export type UpdateProfileInput = {
  full_name?: string;
  email?: string;
  phone?: string | null;
  address?: string | null;
  zone?: string | null;
};

export type ChangePasswordInput = {
  current_password: string;
  new_password: string;
};

export async function updateProfile(input: UpdateProfileInput) {
  return apiRequest<unknown, UpdateProfileInput>({
    method: "PATCH",
    path: "/auth/me",
    body: input,
  });
}

export async function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  const API_URL = import.meta.env.VITE_API_URL || "";
  const res = await fetch(`${API_URL}/api/v1/auth/me/avatar`, {
    method: "POST",
    body: formData,
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Erreur lors de l'upload de l'avatar");
  }

  return res.json();
}

export async function changePassword(input: ChangePasswordInput) {
  return apiRequest<unknown, ChangePasswordInput>({
    method: "POST",
    path: "/auth/change-password",
    body: input,
  });
}

export async function deleteAccount() {
  return apiRequest<unknown>({
    method: "DELETE",
    path: "/auth/me",
  });
}
