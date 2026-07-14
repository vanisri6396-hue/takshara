import { useState, useRef, useEffect, useMemo, useId } from 'react'
import { Search, Plus, Check, ChevronDown, X } from 'lucide-react'
import { useSubjects, useCreateSubject } from '@/hooks/useSubjects'
import { SUBJECT_COLORS } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { SubjectChip } from './SubjectChip'
import type { Subject } from '@/types/design-system'

interface SubjectSelectProps {
  value?: string
  onChange: (subjectId: string) => void
  label?: string
  error?: string
  placeholder?: string
  id?: string
  /** Allow typing a brand-new subject name and creating it on the fly. */
  allowCreate?: boolean
  /** Show a "No subject" option to clear the selection. */
  clearable?: boolean
  className?: string
  disabled?: boolean
}

function deriveCode(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return 'SUB'
  if (words.length === 1) return words[0].slice(0, 4).toUpperCase()
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 4)
    .toUpperCase()
}

export function SubjectSelect({
  value,
  onChange,
  label,
  error,
  placeholder = 'Search or type a subject…',
  id,
  allowCreate = true,
  clearable = false,
  className,
  disabled = false,
}: SubjectSelectProps) {
  const autoId = useId()
  const inputId = id ?? autoId

  const { data: subjects = [] } = useSubjects()
  const createSubject = useCreateSubject()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [creating, setCreating] = useState(false)

  const rootRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selected = useMemo(
    () => subjects.find((s) => s.id === value),
    [subjects, value],
  )

  const trimmed = query.trim()
  const filtered = useMemo(() => {
    const q = trimmed.toLowerCase()
    if (!q) return subjects
    return subjects.filter(
      (s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q),
    )
  }, [subjects, trimmed])

  const exactMatch = useMemo(
    () => subjects.some((s) => s.name.toLowerCase() === trimmed.toLowerCase()),
    [subjects, trimmed],
  )

  const showCreate = allowCreate && trimmed.length > 0 && !exactMatch

  // Build the option list: optional clear, matches, optional create.
  const options: Array<Subject | { __create: true }> = [
    ...filtered,
    ...(showCreate ? [{ __create: true as const }] : []),
  ]

  // Close on outside click.
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  // Keep the highlighted option in view.
  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  // Reset highlight when the list changes.
  useEffect(() => {
    setActiveIndex(0)
  }, [trimmed, open])

  function openMenu() {
    if (disabled) return
    setOpen(true)
    setQuery('')
    // Focus the input on the next tick.
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  async function handleCreate() {
    if (!trimmed) return
    setCreating(true)
    try {
      const created = await createSubject.mutateAsync({
        name: trimmed,
        code: deriveCode(trimmed),
        color: SUBJECT_COLORS[subjects.length % SUBJECT_COLORS.length],
        credits: 3,
      } as Omit<Subject, 'id'>)
      onChange(created.id)
      setQuery('')
      setOpen(false)
    } finally {
      setCreating(false)
    }
  }

  function handleSelect(subject: Subject) {
    onChange(subject.id)
    setQuery('')
    setOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (!open) return setOpen(true)
      setActiveIndex((i) => Math.min(i + 1, options.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const opt = options[activeIndex]
      if (!opt) return
      if ('__create' in opt) handleCreate()
      else handleSelect(opt)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div className={cn('w-full', className)} ref={rootRef}>
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-label-sm font-semibold text-on-surface"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          onClick={openMenu}
          className={cn(
            'flex w-full items-center gap-2 rounded-radius-lg border bg-surface-container-low px-4 py-2.5 text-left text-body-md outline-none transition-colors',
            'border-outline-variant/20 text-on-surface hover:border-outline-variant/40',
            'focus:border-primary-container focus:ring-2 focus:ring-primary-container/30',
            error && 'border-red-500',
            disabled && 'cursor-not-allowed opacity-60',
          )}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          {selected ? (
            <SubjectChip label={selected.name} color={selected.color} size="sm" />
          ) : (
            <span className="flex-1 truncate text-on-surface-variant">
              {open ? '' : placeholder}
            </span>
          )}

          {selected && !open && (
            <X
              className="h-4 w-4 flex-shrink-0 text-on-surface-variant hover:text-on-surface"
              onClick={(e) => {
                e.stopPropagation()
                onChange('')
                setQuery('')
              }}
            />
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 flex-shrink-0 text-on-surface-variant transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>

        {open && (
          <div className="absolute z-30 mt-1.5 w-full overflow-hidden rounded-radius-lg border border-outline-variant/20 bg-surface-container-high shadow-xl">
            <div className="flex items-center gap-2 border-b border-outline-variant/10 px-3 py-2">
              <Search className="h-4 w-4 flex-shrink-0 text-on-surface-variant" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setOpen(true)
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                className="w-full bg-transparent text-body-md text-on-surface outline-none placeholder:text-on-surface-variant"
                autoComplete="off"
              />
            </div>

            <ul
              ref={listRef}
              role="listbox"
              className="max-h-60 overflow-y-auto py-1"
            >
              {clearable && (
                <li
                  data-index={0}
                  role="option"
                  aria-selected={!value}
                  onMouseEnter={() => setActiveIndex(0)}
                  onClick={() => {
                    onChange('')
                    setQuery('')
                    setOpen(false)
                  }}
                  className={cn(
                    'flex cursor-pointer items-center justify-between px-4 py-2 text-body-md',
                    !value
                      ? 'bg-primary-container/15 text-on-surface'
                      : 'text-on-surface-variant hover:bg-surface-container-highest',
                  )}
                >
                  <span>No subject</span>
                  {!value && <Check className="h-4 w-4 text-primary" />}
                </li>
              )}

              {options.length === 0 && (
                <li className="px-4 py-3 text-center text-body-md text-on-surface-variant">
                  No subjects found
                </li>
              )}

              {filtered.map((subject, i) => {
                const index = (clearable ? 1 : 0) + i
                const isSelected = subject.id === value
                return (
                  <li
                    key={subject.id}
                    data-index={index}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleSelect(subject)}
                    className={cn(
                      'flex cursor-pointer items-center justify-between gap-2 px-4 py-2 text-body-md',
                      activeIndex === index
                        ? 'bg-primary-container/15'
                        : 'hover:bg-surface-container-highest',
                      isSelected ? 'text-on-surface' : 'text-on-surface-variant',
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <SubjectChip label={subject.name} color={subject.color} size="sm" />
                      <span className="truncate text-label-sm text-on-surface-variant">
                        {subject.code}
                      </span>
                    </span>
                    {isSelected && <Check className="h-4 w-4 flex-shrink-0 text-primary" />}
                  </li>
                )
              })}

              {showCreate && (
                <li
                  data-index={(clearable ? 1 : 0) + filtered.length}
                  role="option"
                  aria-selected={false}
                  onMouseEnter={() => setActiveIndex((clearable ? 1 : 0) + filtered.length)}
                  onClick={handleCreate}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 border-t border-outline-variant/10 px-4 py-2.5 text-body-md text-primary',
                    activeIndex === (clearable ? 1 : 0) + filtered.length &&
                      'bg-primary-container/15',
                    creating && 'opacity-60',
                  )}
                >
                  <Plus className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {creating ? 'Creating…' : `Create “${trimmed}”`}
                  </span>
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-label-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}