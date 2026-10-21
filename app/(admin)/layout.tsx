import { MobileNav } from "@/components/admin/mobile-nav"
import { SidebarContent } from "@/components/admin/sidebar"

// Reference layout: the sidebar sits on the dark frame, and the content is a
// white panel that fills the rest of the screen, rounded on its left side
// only. Below 1024 px a dark top bar replaces the sidebar.
export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="lg:flex lg:h-dvh">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-background px-4 py-2 text-sm font-medium focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>

      <aside className="no-scrollbar hidden w-62 shrink-0 overflow-y-auto px-4 py-5 lg:block">
        <SidebarContent />
      </aside>

      <MobileNav>
        <SidebarContent />
      </MobileNav>

      <main
        id="main"
        tabIndex={-1}
        className="flex min-h-[calc(100dvh-3.5rem)] flex-col rounded-t-panel bg-background outline-none lg:min-h-0 lg:min-w-0 lg:flex-1 lg:overflow-hidden lg:rounded-none lg:rounded-l-panel"
      >
        {children}
      </main>
    </div>
  )
}
