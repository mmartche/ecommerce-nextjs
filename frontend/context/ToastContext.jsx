"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  registerToastHandler,
  unregisterToastHandler,
} from "../lib/toast";

const ToastContext =
  createContext(null);

export function ToastProvider({
  children,
}) {
  const [toasts, setToasts] =
    useState([]);

  function showToast(
    message,
    type = "error"
  ) {
    const id =
      `${Date.now()}-${Math.random()}`;

    setToasts((current) => [
      ...current,
      {
        id,
        message,
        type,
      },
    ]);

    setTimeout(() => {
      setToasts((current) =>
        current.filter(
          (item) =>
            item.id !== id
        )
      );
    }, 5000);
  }

  function removeToast(id) {
    setToasts((current) =>
      current.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  useEffect(() => {
    registerToastHandler(
      showToast
    );

    return () => {
      unregisterToastHandler();
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showToast,
      }}
    >
      {children}

      <div style={styles.container}>
        {toasts.map(
          (item) => (
            <div
              key={item.id}
              style={{
                ...styles.toast,

                ...(item.type ===
                "success"
                  ? styles.success
                  : item.type ===
                    "info"
                  ? styles.info
                  : styles.error),
              }}
            >
              <span>
                {item.message}
              </span>

              <button
                type="button"
                onClick={() =>
                  removeToast(
                    item.id
                  )
                }
                style={
                  styles.close
                }
              >
                ×
              </button>
            </div>
          )
        )}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context =
    useContext(ToastContext);

  if (!context) {
    throw new Error(
      "useToast must be used inside ToastProvider"
    );
  }

  return context;
}

const styles = {
  container: {
    position: "fixed",
    top: "20px",
    right: "20px",
    zIndex: 99999,
    display: "grid",
    gap: "10px",
    width:
      "min(400px, calc(100vw - 40px))",
  },

  toast: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "10px",
    boxShadow:
      "0 8px 30px rgba(0,0,0,0.16)",
    fontSize: "14px",
  },

  error: {
    background: "#fff2f2",
    color: "#991b1b",
    border:
      "1px solid #fecaca",
  },

  success: {
    background: "#f0fdf4",
    color: "#166534",
    border:
      "1px solid #bbf7d0",
  },

  info: {
    background: "#eff6ff",
    color: "#1e40af",
    border:
      "1px solid #bfdbfe",
  },

  close: {
    border: 0,
    background:
      "transparent",
    fontSize: "20px",
    cursor: "pointer",
    color: "inherit",
  },
};