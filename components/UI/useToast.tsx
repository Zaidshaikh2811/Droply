// hooks/useToast.ts
import { addToast } from "@heroui/react";

type ToastParams = {
    title: string;
    description: string;
    timeout?: number;
    variant?: "bordered" | "flat" | "solid";
    color?: "primary" | "secondary" | "danger" | "success" | "warning";
};

export const useToast = () => {
    return (params: ToastParams) => {
        addToast({
            shouldShowTimeoutProgress: true,
            timeout: params.timeout || 3000,
            variant: params.variant || "flat",
            color: params.color || "primary",
            ...params,
        });
    };
};
