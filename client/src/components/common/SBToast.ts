import { toast } from "react-toastify";


export const sbToastError = (message: string) => {
    toast(`${message}`, { type: "error", autoClose: false, containerId: 'notification-toasts' })
}

export const sbToastInfo = (message: string) => {
    toast(`${message}`, { type: "info", containerId: 'notification-toasts' })
}

export const sbToastSuccess = (message: string) => {
    toast(`${message}`, { type: "success", containerId: 'notification-toasts' })
}

export const sbToastWarning = (message: string) => {
    toast(`${message}`, { type: "warning", containerId: 'notification-toasts' })
}

export const dismissAllToast = () => toast.dismiss();