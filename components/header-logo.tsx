import Link from "next/link";
import Image from "next/image";

export const HeaderLogo = () => {
  return (
    <Link href="/">
      <div className="items-center hidden lg:flex">
        <Image src="/logo.png" alt="Logo" height={36} width={36} className="rounded-lg" />
        <p className="font-semibold text-white text-2xl ml-2.5">
          Finnlo
        </p>
      </div>
    </Link>
  );
};
