export const metadata = {
  title: "SynapseOS",
  description: "Organizational awareness from employee observations",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#07111f", color: "#eef6ff" }}>
        {children}
      </body>
    </html>
  );
}
