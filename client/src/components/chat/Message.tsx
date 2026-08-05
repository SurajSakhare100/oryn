"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Message } from "@/lib/types";
import AnswerCard from "./AnswerCard";

interface MessageProps {
  message: Message;
  index: number;
}

export default function ChatMessage({ message, index }: MessageProps) {
  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: index * 0.05 }}
        className="flex justify-end"
      >
        <div className="flex items-end gap-2.5 max-w-[75%]">
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-br-sm px-4 py-3">
            <p className="text-sm text-zinc-100 leading-relaxed">{message.content}</p>
          </div>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
            <User size={13} className="text-white" />
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="w-full"
    >
      <AnswerCard message={message} />
    </motion.div>
  );
}
