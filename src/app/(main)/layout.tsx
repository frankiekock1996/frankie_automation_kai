import Infobar from "@/components/infobar";
import Sidebar from "@/components/sidebar";
import React from "react";
import { auth } from "@/lib/auth";
import { SessionProvider } from "next-auth/react";
type Props = { children: React.ReactNode };
const Layout = async (props: Props) => {
  const session = await auth()
  return (
    <SessionProvider session={session}>
      <div className="flex overflow-hidden h-screen">
        <Sidebar />
        <div className="w-full">
          <Infobar />
          {props.children}
        </div>
      </div>
    </SessionProvider>
  );
};

export default Layout;
