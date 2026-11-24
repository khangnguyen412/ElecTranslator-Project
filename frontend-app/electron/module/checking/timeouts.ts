export const DOWNLOAD_TIMEOUT_MS = 20 * 60_000;
export const INSTALL_TIMEOUT_MS = 10 * 60_000;
export const BACKEND_START_TIMEOUT_MS = 60_000;

/** UI watchdog — always outlasts every legit main-process path + 5-min slack */
export const UI_POLL_DEADLINE_MS = DOWNLOAD_TIMEOUT_MS + INSTALL_TIMEOUT_MS + BACKEND_START_TIMEOUT_MS + 5 * 60_000;