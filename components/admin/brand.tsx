import Image from "next/image"

export function Brand() {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src="/brand/whitehill-mark.webp"
        alt=""
        width={600}
        height={372}
        priority
        className="h-[22px] w-auto"
      />
      <span className="text-[1.0625rem] font-semibold tracking-tight text-frame-text">
        whitehill
        <span className="ml-1.5 text-xs font-medium text-frame-text-muted">admin</span>
      </span>
    </span>
  )
}
