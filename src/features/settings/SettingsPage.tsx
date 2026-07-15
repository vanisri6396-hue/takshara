import { useState } from 'react'
import { Bell, Shield, Palette, Globe } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { useSettings } from '@/hooks/useSettings'
import { useUpdateSettings } from '@/hooks/useSettings'
import { toast } from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { Settings } from '@/types/design-system'

const SECTIONS = [
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'privacy', label: 'Privacy & Security', icon: Shield },
  { id: 'language', label: 'Language & Region', icon: Globe },
] as const

type SectionId = typeof SECTIONS[number]['id']

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SectionId>('appearance')
  const settingsQuery = useSettings()
  const updateMutation = useUpdateSettings()

  const isLoading = settingsQuery.isLoading
  const settings = settingsQuery.data

  const updateSetting = async (key: keyof Settings, value: Settings[keyof Settings]) => {
    await updateMutation.mutateAsync({ [key]: value } as Partial<Settings>)
    toast.success('Settings saved')
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-container border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="animate-fade-in-up">
        <h1 className="font-headline text-headline-lg text-on-surface">Settings</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">Manage your preferences</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="animate-fade-in-up">
          <Card variant="glass" className="p-2">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-radius-lg px-4 py-3 text-label-md transition-all duration-200',
                  activeSection === section.id
                    ? 'bg-primary-container/15 text-primary-container'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
                )}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </Card>
        </div>

        {/* Content */}
        <div className="lg:col-span-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          {activeSection === 'appearance' && (
            <Card variant="glass" className="p-6">
              <div className="mb-6">
                <h2 className="font-headline text-headline-md text-on-surface">Appearance</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">Customize how Takshara looks</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Dark Mode</p>
                    <p className="text-label-sm text-on-surface-variant">Coming soon</p>
                  </div>
                  <Badge variant="info" size="sm">Soon</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Font Size</p>
                    <p className="text-label-sm text-on-surface-variant">Adjust text size</p>
                  </div>
                  <select
                    value={settings?.font_size ?? 'medium'}
                    onChange={(e) => updateSetting('font_size', e.target.value as Settings['font_size'])}
                    className="rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-body-sm text-on-surface"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Accent Color</p>
                    <p className="text-label-sm text-on-surface-variant">Primary theme color</p>
                  </div>
                  <div className="flex gap-2">
                    {['#d4af37', '#059669', '#2563eb', '#7c3aed', '#dc2626'].map((color) => (
                      <button
                        key={color}
                        onClick={() => updateSetting('accent_color', color as Settings['accent_color'])}
                        className={cn(
                          'h-8 w-8 rounded-full border-2 transition-all duration-200',
                          settings?.accent_color === color
                            ? 'border-on-surface scale-110'
                            : 'border-transparent hover:scale-105',
                        )}
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'notifications' && (
            <Card variant="glass" className="p-6">
              <div className="mb-6">
                <h2 className="font-headline text-headline-md text-on-surface">Notifications</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">Manage notification preferences</p>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'push_notifications' as const, label: 'Push Notifications', desc: 'Receive push notifications' },
                  { key: 'email_reminders' as const, label: 'Email Reminders', desc: 'Get reminders via email' },
                  { key: 'assignment_alerts' as const, label: 'Assignment Alerts', desc: 'Alerts for upcoming deadlines' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between">
                    <div>
                      <p className="text-body-md font-medium text-on-surface">{item.label}</p>
                      <p className="text-label-sm text-on-surface-variant">{item.desc}</p>
                    </div>
                    <button
                      onClick={() => updateSetting(item.key, !settings?.[item.key] as Settings[typeof item.key])}
                      className={cn(
                        'relative h-8 w-14 rounded-full transition-colors duration-200',
                        settings?.[item.key] ? 'bg-primary-container' : 'bg-surface-container-high',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-200',
                          settings?.[item.key] && 'translate-x-6',
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeSection === 'privacy' && (
            <Card variant="glass" className="p-6">
              <div className="mb-6">
                <h2 className="font-headline text-headline-md text-on-surface">Privacy & Security</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">Control your privacy settings</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-medium text-on-surface">Two-Factor Authentication</p>
                    <p className="text-label-sm text-on-surface-variant">Add extra security</p>
                  </div>
                  <button
                    onClick={() => updateSetting('two_factor_auth', !settings?.two_factor_auth as Settings['two_factor_auth'])}
                    className={cn(
                      'relative h-8 w-14 rounded-full transition-colors duration-200',
                      settings?.two_factor_auth ? 'bg-primary-container' : 'bg-surface-container-high',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute left-1 top-1 h-6 w-6 rounded-full bg-white transition-transform duration-200',
                        settings?.two_factor_auth && 'translate-x-6',
                      )}
                    />
                  </button>
                </div>

                <div>
                  <p className="text-body-md font-medium text-on-surface">Session Timeout</p>
                  <p className="text-label-sm text-on-surface-variant">Automatically log out after inactivity</p>
                  <select
                    value={settings?.session_timeout ?? '30'}
                    onChange={(e) => updateSetting('session_timeout', e.target.value as Settings['session_timeout'])}
                    className="mt-2 rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-body-sm text-on-surface"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'language' && (
            <Card variant="glass" className="p-6">
              <div className="mb-6">
                <h2 className="font-headline text-headline-md text-on-surface">Language & Region</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">Set your language and region</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-body-md font-medium text-on-surface">Language</label>
                  <select className="mt-2 w-full rounded-radius-lg border border-outline-variant/20 bg-surface-container-low px-3 py-2 text-body-sm text-on-surface">
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}