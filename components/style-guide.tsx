"use client"

import { Card } from "@/components/ui/card"

export function StyleGuide() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-foreground mb-2">LearnSync Design System</h1>
      <p className="text-muted-foreground mb-12">Complete style guide for consistent UI/UX across all portals</p>

      {/* Colors */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Color Palette</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-3">
            <div className="w-full h-24 bg-primary rounded-lg shadow-md"></div>
            <div>
              <p className="font-semibold text-foreground">Primary</p>
              <p className="text-sm text-muted-foreground">oklch(0.45 0.25 260)</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-24 bg-secondary rounded-lg shadow-md"></div>
            <div>
              <p className="font-semibold text-foreground">Secondary</p>
              <p className="text-sm text-muted-foreground">oklch(0.52 0.18 200)</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-24 bg-accent rounded-lg shadow-md"></div>
            <div>
              <p className="font-semibold text-foreground">Accent</p>
              <p className="text-sm text-muted-foreground">oklch(0.58 0.22 30)</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-24 bg-muted rounded-lg shadow-md border border-border"></div>
            <div>
              <p className="font-semibold text-foreground">Muted</p>
              <p className="text-sm text-muted-foreground">oklch(0.92 0.01 250)</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="w-full h-24 bg-destructive rounded-lg shadow-md"></div>
            <div>
              <p className="font-semibold text-foreground">Destructive</p>
              <p className="text-sm text-muted-foreground">Error/Warning</p>
            </div>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Typography</h2>
        <div className="space-y-6">
          <Card className="p-6">
            <h1 className="text-4xl font-bold text-foreground mb-2">Display Heading - 36px</h1>
            <p className="text-muted-foreground">Geist Bold • Used for page titles</p>
          </Card>
          <Card className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">Section Heading - 24px</h2>
            <p className="text-muted-foreground">Geist Bold • Used for section titles</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-2">Subsection - 18px</h3>
            <p className="text-muted-foreground">Geist Semibold • Used for card titles</p>
          </Card>
          <Card className="p-6">
            <p className="text-base text-foreground mb-2">Body Text - 16px</p>
            <p className="text-muted-foreground">Geist Regular • Standard paragraph text with 1.5 line height</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">Small Text - 14px</p>
            <p className="text-muted-foreground">Geist Regular • Used for captions and helper text</p>
          </Card>
        </div>
      </section>

      {/* Components */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Components</h2>

        {/* Buttons */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Buttons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Primary Button</p>
              <button className="w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out active:scale-95 bg-primary hover:bg-primary/90 text-primary-foreground">
                Primary Action
              </button>
              <p className="text-xs text-muted-foreground">Use for main actions and confirmations</p>
            </Card>
            <Card className="p-6 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Secondary Button</p>
              <button className="w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out active:scale-95 bg-secondary hover:bg-secondary/90 text-secondary-foreground">
                Secondary Action
              </button>
              <p className="text-xs text-muted-foreground">Use for alternative actions</p>
            </Card>
            <Card className="p-6 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Outline Button</p>
              <button className="w-full font-semibold py-2.5 px-4 rounded-lg transition-all duration-300 ease-in-out border border-input hover:bg-muted text-foreground">
                Outline Action
              </button>
              <p className="text-xs text-muted-foreground">Use for cancel or less important actions</p>
            </Card>
            <Card className="p-6 space-y-4">
              <p className="text-sm font-semibold text-muted-foreground">Disabled Button</p>
              <button
                className="w-full font-semibold py-2.5 px-4 rounded-lg bg-muted text-muted-foreground cursor-not-allowed"
                disabled
              >
                Disabled
              </button>
              <p className="text-xs text-muted-foreground">Use for unavailable actions</p>
            </Card>
          </div>
        </div>

        {/* Inputs */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Form Inputs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Text Input</label>
              <input
                type="text"
                placeholder="Enter text"
                className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition-all duration-300"
              />
            </Card>
            <Card className="p-6">
              <label className="block text-sm font-medium mb-2 text-foreground">Select</label>
              <select className="w-full px-4 py-2.5 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground transition-all duration-300">
                <option>Select an option</option>
                <option>Option 1</option>
                <option>Option 2</option>
              </select>
            </Card>
          </div>
        </div>

        {/* Cards */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Card Component</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <h4 className="text-lg font-semibold text-foreground mb-2">Standard Card</h4>
              <p className="text-muted-foreground">
                Used for grouping related content with consistent spacing and styling
              </p>
            </Card>
            <Card className="p-6 border-l-4 border-l-primary transition-all duration-300 hover:shadow-lg hover:border-primary/50">
              <h4 className="text-lg font-semibold text-foreground mb-2">Accent Card</h4>
              <p className="text-muted-foreground">Used for highlighted or important information</p>
            </Card>
          </div>
        </div>

        {/* Status Badges */}
        <div className="mb-12">
          <h3 className="text-lg font-semibold text-foreground mb-4">Status Badges</h3>
          <Card className="p-6 flex flex-wrap gap-3">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
              Active
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800">
              Warning
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
              Inactive
            </span>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
              Info
            </span>
          </Card>
        </div>
      </section>

      {/* Animations */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Animations & Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="animate-in fade-in duration-500 mb-4 w-12 h-12 bg-primary rounded-lg"></div>
            <p className="font-semibold text-foreground mb-2">Fade In</p>
            <p className="text-sm text-muted-foreground">500ms duration • Entry animation</p>
          </Card>
          <Card className="p-6">
            <div className="animate-in slide-in-from-bottom-4 duration-500 mb-4 w-12 h-12 bg-secondary rounded-lg"></div>
            <p className="font-semibold text-foreground mb-2">Slide Up</p>
            <p className="text-sm text-muted-foreground">500ms duration • Modal/Drawer entry</p>
          </Card>
          <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer">
            <div className="mb-4 w-12 h-12 bg-accent rounded-lg"></div>
            <p className="font-semibold text-foreground mb-2">Hover Lift</p>
            <p className="text-sm text-muted-foreground">300ms duration • Card interaction</p>
          </Card>
        </div>
      </section>

      {/* Spacing */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Spacing Scale</h2>
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-2 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">2px (0.125rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-3 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">3px (0.1875rem)</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-4 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">4px (0.25rem) - p-1, m-1</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-6 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">6px (0.375rem) - p-1.5, m-1.5</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-8 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">8px (0.5rem) - p-2, m-2</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">12px (0.75rem) - p-3, m-3</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-16 h-6 bg-primary rounded"></div>
              <p className="text-sm text-foreground">16px (1rem) - p-4, m-4</p>
            </div>
          </div>
        </Card>
      </section>

      {/* Usage Guidelines */}
      <section>
        <h2 className="text-2xl font-bold text-foreground mb-6">Usage Guidelines</h2>
        <div className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Consistency</h3>
            <p className="text-muted-foreground">
              Always use standard Tailwind classes. Maintain consistent spacing, colors, and typography across all
              pages.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Accessibility</h3>
            <p className="text-muted-foreground">
              All components include proper ARIA labels, semantic HTML, and keyboard navigation support.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Performance</h3>
            <p className="text-muted-foreground">
              Use animations sparingly. Keep animations under 500ms for a responsive feel.
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="font-semibold text-foreground mb-2">Dark Mode</h3>
            <p className="text-muted-foreground">
              All colors automatically adapt to dark mode. Test components in both light and dark themes.
            </p>
          </Card>
        </div>
      </section>
    </div>
  )
}
