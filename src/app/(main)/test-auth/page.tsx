"use client";
import { useSession } from "next-auth/react";
export default function Dashboard() {
  const { data: session } = useSession();
  console.log("session", session);
  return <div>测试</div>;
}
