import { toast } from "react-toastify";

export function ShowSuccessToast(message) {
    toast.success(message)
}
export function ShowErrorToast(message) {
    toast.error(message)
}
export function ShowInfoToast(message) {
    toast.info(message)
}
export function ShowWarnToast(message) {
    toast.warn(message)
}