export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="flex items-center justify-between border-t border-border px-6 py-3 text-xs text-muted-foreground">
      <span>{year} © Goalpost</span>
      <span>v1.0.0</span>
    </footer>
  );
}
