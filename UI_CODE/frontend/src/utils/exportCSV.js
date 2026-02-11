import React from "react";
import { Download } from "lucide-react";

export function exportToCSV(data, filename = "export.csv") {
  if (!data || data.length === 0) {
    return false;
  }

  try {
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(",");

    const csvRows = data.map((row) => {
      return headers
        .map((header) => {
          const value = row[header];
          if (typeof value === "string" && value.includes(",")) {
            return `"${value}"`;
          }
          return value;
        })
        .join(",");
    });

    const csvContent = [csvHeaders, ...csvRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error("Export error:", error);
    return false;
  }
}

export function ExportButton({
  data,
  filename,
  label = "Export CSV",
  onExport,
}) {
  const handleExport = () => {
    const success = exportToCSV(data, filename);
    if (success && onExport) {
      onExport();
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data || data.length === 0}
      style={{
        padding: "12px 24px",
        background:
          data && data.length > 0
            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            : "#64748b",
        color: "white",
        border: "none",
        borderRadius: "10px",
        cursor: data && data.length > 0 ? "pointer" : "not-allowed",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (data && data.length > 0) {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 8px 20px rgba(102, 126, 234, 0.4)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <Download size={18} />
      {label}
    </button>
  );
}
