import { toast } from "react-toastify";


export const sbToastError = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.ERROR, autoClose: false, containerId: 'notification-toasts' })
}

export const sbToastInfo = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.INFO, containerId: 'notification-toasts' })
}

export const sbToastSuccess = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.SUCCESS, containerId: 'notification-toasts' })
}

export const sbToastWarning = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.WARNING, containerId: 'notification-toasts' })
}

export const dismissAllToast = () => toast.dismiss();