import { getCurrentUser } from "@/services/clerk";
import React from "react";
import StatusToaster from "../SocketTaoster";

export default async function SocketClient() {
  const { userId } = await getCurrentUser();
  if (!userId) return;
  return <StatusToaster userId={userId}></StatusToaster>;
}
