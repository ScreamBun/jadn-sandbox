import { toast } from "react-toastify";


export const sbToastError = (message:string) => {
    toast(`${message}`, { type: toast.TYPE.ERROR })
}

export const sbToastInfo = (message:string) => {
    toast(`${message}`, { type: toast.TYPE.INFO })
}    

export const sbToastSuccess = (message:string) => {
    toast(`${message}`, { type: toast.TYPE.SUCCESS })
}   

export const sbToastWarning = (message:string) => {
    toast(`${message}`, { type: toast.TYPE.WARNING })
}    

export const sbToastErrorFreeze = (message:string) => {
    toast(`${message}`, { type: toast.TYPE.ERROR, autoClose: false })
}

export const dismissAllToast = () =>  toast.dismiss();