// Assuming this file is saved as layouts/ExamplePageLayout.js
import RootLayout from './RootLayout';

export default function TxLayout({ children }: Readonly<{children: React.ReactNode;}>) {
  return (
    <RootLayout 
      title="TxBuilder" 
      description="Building transaction">
      <header>
        Header
      </header>
      <main>{children}</main>
      <footer>
        Footer
      </footer>
    </RootLayout>
  );
}
