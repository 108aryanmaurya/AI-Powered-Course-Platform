"use client";

import { useToast } from "@/hooks/use-toast";
import { socket } from "@/services/socket";
import { useEffect } from "react";

export default function SocketClient() {
  const { toast } = useToast();

  useEffect(() => {
    if (!socket) return;
    console.log("hello");
    // socket.emit("join", { user_id: userId });

    // socket.on("video_status", (data) => {
    //   console.log(data);
    //   toast(data.step);
    // });
    // return () => {
    //   socket.off("video_status");
    // };
  }, [toast]);
  return null;
}
