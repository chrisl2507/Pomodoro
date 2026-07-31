import { BRAND } from './brand'

/* Completion notifications. On device, an OS-scheduled local notification
   is registered for endAt the moment a phase starts (and cancelled on
   pause) — it fires even if the app is suspended or killed. In a plain
   browser there is no OS scheduler, so the tick loop calls fireNow() when
   it detects completion; the Notification API covers a backgrounded tab. */

const NOTIFICATION_ID = 1001

function isCapacitorNative(): boolean {
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }
  return Boolean(w.Capacitor?.isNativePlatform?.())
}

export async function requestNotificationPermission(): Promise<void> {
  try {
    if (isCapacitorNative()) {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      await LocalNotifications.requestPermissions()
    } else if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      await Notification.requestPermission()
    }
  } catch {
    /* denied or unsupported — the in-app state change still shows */
  }
}

export async function scheduleCompletion(atMs: number, body: string): Promise<void> {
  if (!isCapacitorNative()) return // web: fired by the tick via fireNow
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.schedule({
      notifications: [
        {
          id: NOTIFICATION_ID,
          title: BRAND.name,
          body,
          schedule: { at: new Date(atMs) },
        },
      ],
    })
  } catch {
    /* permission missing — completion still lands via the resumed app */
  }
}

export async function cancelScheduled(): Promise<void> {
  if (!isCapacitorNative()) return
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: NOTIFICATION_ID }] })
  } catch {
    /* nothing scheduled */
  }
}

/** Web-path completion signal, called by the tick when endAt passes. */
export function fireNow(body: string): void {
  if (isCapacitorNative()) return // the OS-scheduled notification handled it
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (document.hasFocus()) return
  try {
    new Notification(BRAND.name, { body, tag: `${BRAND.name}-phase` })
  } catch {
    /* some platforms only allow notifications from service workers */
  }
}
