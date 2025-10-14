"use client";
import { motion } from "framer-motion";
import React from "react";

export const PoolsIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <motion.svg
    viewBox="0 0 260 140"
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
      <ellipse cx="130" cy="78" rx="96" ry="24" />
      <path d="M34 78c28-26 128-26 204 0" />
      <path d="M54 86c28-20 120-20 190 0" />
      <path d="M74 92c24-14 112-14 166 0" />
    </g>
  </motion.svg>
);
