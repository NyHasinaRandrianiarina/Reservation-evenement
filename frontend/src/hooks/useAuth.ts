import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AuthStatus } from "@/store/useAuthStore";

export { AuthStatus };

export function useAuth() {
    const { user, isAuthenticated, status, init, isLoading, pending2faTempToken } = useAuthStore();

    useEffect(() => {
        if (status === AuthStatus.Unknown) {
            void init();
        }
    }, [init, status]);

    return {
        user,
        isAuthenticated,
        status,
        isLoading,
        pending2faTempToken,
    };
}