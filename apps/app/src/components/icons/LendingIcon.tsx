"use client";
import { motion } from "framer-motion";
import React from "react";

export const LendingIcon: React.FC<{ className?: string }> = ({
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
      <path d="M110 10 L170 34 C170 80 136 106 110 120 C84 106 50 80 50 34 L110 10 Z" />
      <path d="M110 36 v40" />
      <path d="M86 68 h48" />
      <circle cx="110" cy="32" r="2.5" />
    </g>
  </motion.svg>
);
