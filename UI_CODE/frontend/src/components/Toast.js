import React, { useEffect } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";

export default function Toast({
  message,
  type = "success",
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const styles = {
    success: {
      bg: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
      icon: CheckCircle,
    },
    error: {
      bg: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      icon: XCircle,
    },
    info: {
      bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      icon: Info,
    },
  };

  const currentStyle = styles[type] || styles.success;
  const Icon = currentStyle.icon;

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        background: currentStyle.bg,
        color: "white",
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        zIndex: 10000,
        animation: "slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        minWidth: "320px",
        maxWidth: "500px",
      }}
    >
      <Icon size={22} strokeWidth={2.5} />
      <span style={{ flex: 1, fontSize: "14px", fontWeight: "500" }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: "rgba(255,255,255,0.2)",
          border: "none",
          borderRadius: "50%",
          width: "28px",
          height: "28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
        }
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = React.useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const hideToast = () => {
    setToast(null);
  };

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null;

  return { showToast, ToastComponent };
}
