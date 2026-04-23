import Image from "next/image";

export function LogoLockup() {
  return (
    <div className="flex mt-12 items-center gap-6" aria-label="Scala e UVV">
      <Image
        src="/logo-scala.JPG"
        alt="Scala"
        width={105}
        height={42}
        className="h-auto w-26.25"
        priority
      />
      <Image
        src="/logo-uvv.png"
        alt="Universidade Vila Velha"
        width={64}
        height={64}
        className="h-16 w-16 object-contain"
        priority
      />
    </div>
  );
}
