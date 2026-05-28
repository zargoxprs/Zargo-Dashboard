import React from "react";

const RupeeIcon = ({ size = 16, className = "" }: { size?: number; className?: string }) => (
  <div
    className={className}
    style={{ fontSize: size, lineHeight: 1, display: "inline-flex", alignItems: "center", justifyContent: "center" }}
    aria-hidden
  >
    ₹
  </div>
);

export default RupeeIcon;
