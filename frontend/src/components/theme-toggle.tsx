import { Button } from '@endsoul/react-ui'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useSyncExternalStore } from 'react'

const MODES = ['light', 'dark', 'system'] as const
type Mode = (typeof MODES)[number]

const LABELS: Record<Mode, string> = {
  light: '라이트 모드',
  dark: '다크 모드',
  system: '시스템 설정',
}

const ICONS = {
  light: SunIcon,
  dark: MoonIcon,
  system: MonitorIcon,
} as const

// SSR 결과와 첫 클라이언트 렌더를 일치시키기 위한 마운트 감지
const subscribe = () => () => {}
const useMounted = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme()
  const mounted = useMounted()

  // 마운트 전에는 서버가 알 수 없으므로 system으로 고정해 렌더링을 맞춘다
  const current: Mode =
    mounted && MODES.includes(theme as Mode) ? (theme as Mode) : 'system'
  const next = MODES[(MODES.indexOf(current) + 1) % MODES.length]
  const Icon = ICONS[current]

  return (
    <Button
      onClick={() => setTheme(next)}
      aria-label={`현재 ${LABELS[current]}. 클릭하면 ${LABELS[next]}로 바뀝니다.`}
      title={LABELS[current]}
    >
      <Icon className="size-5" />
    </Button>
  )
}
