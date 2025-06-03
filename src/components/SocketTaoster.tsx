"use client";
import { useToast } from "@/hooks/use-toast";
import { socket } from "@/services/socket";
import { useEffect } from "react";
export default function StatusToaster({ userId }: { userId: string | null }) {
  const { toast } = useToast();
  useEffect(() => {
    if (!socket || !userId) return;
    console.log("hello");
    // socket.emit("join", { user_id: userId });

    socket.on("video_status", (data) => {
      console.log(data);
      toast(data.step);
    });
    return () => {
      socket.off("video_status");
    };
  }, [userId, toast]);

  if (!userId) return null;
  return null; // or your UI
}
