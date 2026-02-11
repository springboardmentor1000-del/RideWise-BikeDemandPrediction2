import React from "react";

export function BookingSkeleton() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "12px",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              height: "20px",
              borderRadius: "8px",
              marginBottom: "10px",
              width: "60%",
            }}
          />
          <div
            style={{
              background: "rgba(255, 255, 255, 0.1)",
              height: "16px",
              borderRadius: "8px",
              width: "80%",
            }}
          />
        </div>
        <div
          style={{
            background: "rgba(255, 255, 255, 0.1)",
            height: "40px",
            width: "100px",
            borderRadius: "10px",
          }}
        />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.03)",
        borderRadius: "15px",
        padding: "25px",
        border: "1px solid rgba(102, 126, 234, 0.2)",
        animation: "pulse 1.5s ease-in-out infinite",
      }}
    >
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          height: "24px",
          borderRadius: "8px",
          marginBottom: "15px",
          width: "70%",
        }}
      />
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          height: "16px",
          borderRadius: "8px",
          marginBottom: "10px",
          width: "90%",
        }}
      />
      <div
        style={{
          background: "rgba(255, 255, 255, 0.1)",
          height: "16px",
          borderRadius: "8px",
          width: "60%",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

export default function LoadingSkeleton({ type = "booking", count = 1 }) {
  const skeletons = {
    booking: BookingSkeleton,
    card: CardSkeleton,
  };

  const SkeletonComponent = skeletons[type] || BookingSkeleton;

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonComponent key={idx} />
      ))}
    </>
  );
}
