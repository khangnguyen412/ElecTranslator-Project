/* eslint-disable */
export const SESSION_KEY = 'elec_check_error';

export const saveCheckState = (state: any) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
}

export const loadCheckState = () => {
    try {
        const state = sessionStorage.getItem(SESSION_KEY);
        return state ? JSON.parse(state) : null;
    } catch {
        return null;
    }
}

export const clearCheckState = () => {
    sessionStorage.removeItem(SESSION_KEY);
}