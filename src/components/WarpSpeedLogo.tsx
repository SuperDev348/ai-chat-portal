import Image from "next/image";
import logo from "@/assets/logo.png";

export function WarpSpeedLogo({ className }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt="WarpSpeed"
      width={40}
      height={40}
      className={className}
    />
  );
}
