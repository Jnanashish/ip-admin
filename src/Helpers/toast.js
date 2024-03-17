import { toast } from "react-toastify";

export function showSuccessToast(message) {
    toast.success(message)
}
export function showErrorToast(message) {
    toast.error(message)
}
export function showInfoToast(message) {
    toast.info(message)
}
export function showWarnToast(message) {
    toast.warn(message)
}