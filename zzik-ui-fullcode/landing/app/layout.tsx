import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ZZIK — Location Discovery & Rewards",
  description: "Pokemon GO + Xiaohongshu for Local Discovery",
  keywords: ["location", "rewards", "discovery", "crypto", "usdc"],
};

// This is the root layout that delegates to locale-specific layouts
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
