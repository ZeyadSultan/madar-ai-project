import Link from "next/link";
import { Mark } from "./Marks";

export function Brand({ href = "/", size = 28 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="flex items-center gap-2.5">
      <Mark size={size} />
      <span className="text-[17px] font-semibold text-heading">Madar AI</span>
    </Link>
  );
}
