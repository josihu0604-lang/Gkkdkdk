import "./styles/globals.css";
export const metadata = { title: "ZZIK — Location Integrity SaaS", description: "GPS 무결성 기반 B2B SaaS" };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return (<html lang="ko"><body>{children}</body></html>);
}
