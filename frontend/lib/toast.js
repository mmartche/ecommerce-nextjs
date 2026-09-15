let toastHandler = null;

export function registerToastHandler(handler) {
  toastHandler = handler;
}

export function unregisterToastHandler() {
  toastHandler = null;
}

export const toast = {
  error(message) {
    toastHandler?.(
      message,
      "error"
    );
  },

  success(message) {
    toastHandler?.(
      message,
      "success"
    );
  },

  info(message) {
    toastHandler?.(
      message,
      "info"
    );
  },
};