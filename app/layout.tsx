import "./globals.css";

export default async function RootLayout({ children }: { children: React.ReactNode }) {

  return (
    <html>
      <head>
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta name="msapplication-TileImage" content="/favicon/ms-icon-144x144.png" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body className="min-h-screen overflow-auto">
                        {children}
      </body>
    </html>
  );
}
