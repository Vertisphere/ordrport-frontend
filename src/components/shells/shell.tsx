import { cn } from "@/lib/utils"

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  variant?: "default" | "sidebar"
}

export function Shell({
  children,
  variant = "default",
  className,
  ...props
}: ShellProps) {
  return (
    <div
      className={cn(
        "grid items-start gap-8 p-4",
        {
          "lg:grid-cols-[220px_1fr] lg:gap-10": variant === "sidebar",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
} 