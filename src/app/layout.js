import "./globals.css";

export const metadata = {
  title: "TrackWise — your job search, in one pipeline",
  description:
    "Track applications, score how well each job fits your resume, and draft tailored cover letters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
