import { toast } from "react-toastify";


export const sbToastError = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.ERROR, autoClose: false, containerId: 'B' })
}

export const sbToastInfo = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.INFO, containerId: 'B' })
}

export const sbToastSuccess = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.SUCCESS, containerId: 'B' })
}

export const sbToastWarning = (message: string) => {
    toast(`${message}`, { type: toast.TYPE.WARNING, containerId: 'B' })
}

export const dismissAllToast = () => toast.dismiss();