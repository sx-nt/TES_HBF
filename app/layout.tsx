import type { Metadata } from "next"
export const metadata: Metadata = {
  title: "TES HBF",
  description: "Uma aventura narrativa retrofuturista.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, background: "#05070b" }}>{children}</body>
    </html>
  )
}
