
import Link from "next/link";
import Image from "next/image";
import { MenuIcon } from "lucide-react";
import { NavBody, NavItems, ResizableNavbar } from "../ui/resizable-navbar";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";

const Navbar = async () => {
  const session = await auth(); // safe now
  const userId = session?.user?.id;

  const navItems = [
    { name: "Products", link: "#" },
    { name: "Resources", link: "#" },
    { name: "Documentation", link: "#" },
    { name: "Playground", link: "#" },
  ];

  return (
    <ResizableNavbar className="fixed top-0">
      <NavBody className={cn("bg-black/40 backdrop-blur-lg border-b-[1px] border-neutral-900 py-4 px-4 z-[100]", "dark:bg-neutral-950/80")}>
        <aside className="flex items-center gap-[2px]">
          <p className="text-3xl font-bold">A</p>
          <Image src="/fuzzieLogo.png" width={15} height={15} alt="DELL logo" className="shadow-sm" />
          <p className="text-3xl font-bold">PP</p>
        </aside>

        <NavItems items={navItems} className="text-neutral-300 hover:text-white" />

        <aside className="flex items-center gap-4">
          <Link
            href={userId ? "/dashboard" : "/api/auth/signin"}
            className="relative inline-flex h-10 overflow-hidden rounded-full p-[2px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50"
          >
            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E2CBFF_0%,#393BB2_50%,#E2CBFF_100%)]" />
            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-slate-950 px-3 py-1 text-sm font-medium text-white backdrop-blur-3xl">
              {userId ? "Dashboard" : "Get Started"}
            </span>
          </Link>
          <MenuIcon className="md:hidden text-white" />
        </aside>
      </NavBody>
    </ResizableNavbar>
  );
};

export default Navbar;
