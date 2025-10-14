"use client";
import { motion } from "framer-motion";
import React from "react";

export const ManagedIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <motion.svg
    viewBox="0 0 220 140"
    xmlns="http://www.w3.org/2000/svg"
    className={`w-full h-auto ${className}`}
    initial={{ opacity: 0.75 }}
    whileHover={{ scale: 1.03, opacity: 1 }}
    transition={{ duration: 0.35 }}
  >
    <g
      stroke="rgba(255,255,255,0.06)"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="12" y="34" width="160" height="68" rx="8" />
      <rect x="46" y="14" width="108" height="28" rx="6" />
      <circle cx="118" cy="68" r="10" />
      <path d="M118 68 L128 58" />
      <path d="M20 106 H192" />
    </g>
  </motion.svg>
);
