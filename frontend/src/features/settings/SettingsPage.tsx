import { useState } from 'react'
import {
  Bell,
  Shield,
  Palette,
  Globe,
  Monitor,
  Smartphone,
  Moon,
  ChevronRight,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { GlassCard } from '@/components/ui/GlassCard'
import { cn } from '@/lib/utils'

const SETTINGS_SECTIONS = [
  {
    id: 'appearance',
    icon: <Palette className="h-5 w-5" />,
    title: 'Appearance',
    description: 'Customize your visual experience',
    items: [
      { label: 'Theme', value: 'Dark Mode', icon: <Moon className="h-4 w-4" /> },
      { label: 'Accent Color', value: 'Gold', icon: <Palette className="h-4 w-4" /> },
      { label: 'Font Size', value: 'Medium', icon: <Monitor className="h-4 w-4" /> },
    ],
  },
  {
    id: 'notifications',
    icon: <Bell className="h-5 w-5" />,
    title: 'Notifications',
    description: 'Manage your notification preferences',
    items: [
      { label: 'Push Notifications', value: 'Enabled', icon: <Smartphone className="h-4 w-4" /> },
      { label: 'Email Reminders', value: 'Enabled', icon: <Bell className="h-4 w-4" /> },
      { label: 'Assignment Alerts', value: '24h before', icon: <Bell className="h-4 w-4" /> },
    ],
  },
  {
    id: 'privacy',
    icon: <Shield className="h-5 w-5" />,
    title: 'Privacy & Security',
    description: 'Control your data and security',
    items: [
      { label: 'Two-Factor Auth', value: 'Disabled', icon: <Shield className="h-4 w-4" /> },
      { label: 'Session Timeout', value: '30 minutes', icon: <Monitor className="h-4 w-4" /> },
      { label: 'Data Sharing', value: 'Limited', icon: <Globe className="h-4 w-4" /> },
    ],
  },
]

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('appearance')

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Settings</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Manage your preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 animate-fade-in-up">
          <Card variant="glass" className="p-2">
            {SETTINGS_SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-radius-lg px-4 py-3 text-left transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-primary-container/15 text-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                <span className="flex-shrink-0">{section.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-body-md font-medium">{section.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{section.description}</p>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0" />
              </button>
            ))}
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="space-y-4">
            {SETTINGS_SECTIONS.find((s) => s.id === activeSection)?.items.map((item, i) => (
              <div
                key={item.label}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <GlassCard className="flex items-center justify-between p-4 transition-all duration-200 hover:scale-[1.01]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-radius bg-surface-container-high text-on-surface-variant">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-body-md font-medium text-on-surface">{item.label}</p>
                      <p className="text-label-sm text-on-surface-variant">{item.value}</p>
                    </div>
                  </div>
                  <button className="rounded-radius-lg border border-outline-variant/20 px-3 py-1.5 text-label-sm text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface">
                    Edit
                  </button>
                </GlassCard>
              </div>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="mt-6">
            <Card variant="glass" className="border-red-500/20 p-5">
              <h3 className="font-headline text-headline-md text-red-400">Danger Zone</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">
                Irreversible account actions
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="rounded-radius-lg border border-red-500/30 px-4 py-2 text-label-sm text-red-400 transition-all duration-200 hover:bg-red-500/10">
                  Delete Account
                </button>
                <button className="rounded-radius-lg border border-outline-variant/20 px-4 py-2 text-label-sm text-on-surface-variant transition-all duration-200 hover:bg-surface-container-high hover:text-on-surface">
                  Export Data
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}