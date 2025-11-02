import Image from "next/image";
import ethereum from "@/components/assets/ethereum.svg";

export default function LogoCloud() {
  return (
    <section className="bg-black py-16">
      <div className="mx-auto max-w-5xl px-6">
        <h2 className="text-center text-lg font-medium">
          built on top of trusted infrastructure
        </h2>
        <div className="mx-auto mt-12 flex max-w-4xl flex-wrap items-center justify-center gap-x-12 gap-y-8 sm:gap-x-16 sm:gap-y-12">
          <Image
            className="h-8 w-fit"
            src={ethereum}
            alt="Ethereum Logo"
            height={16}
          />
        </div>
      </div>
    </section>
  );
}
