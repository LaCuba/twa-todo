export {}

declare global {
  interface Window {
    Telegram?: Telegram
  }

  interface Telegram {
    WebApp: TelegramWebApp
  }

  interface TelegramWebApp {
    initData: string
    initDataUnsafe: TelegramInitData
    version: string
    platform: string
    colorScheme: 'light' | 'dark'
    themeParams: {
      bg_color?: string
      text_color?: string
      hint_color?: string
      link_color?: string
      button_color?: string
      button_text_color?: string
    }
    isExpanded: boolean
    viewportHeight: number
    viewportStableHeight: number
    isClosingConfirmationEnabled: boolean
    BackButton: {
      isVisible: boolean
      show(): void
      hide(): void
      onClick(callback: () => void): void
    }
    MainButton: {
      isVisible: boolean
      isActive: boolean
      isProgressVisible: boolean
      setText(text: string): void
      onClick(callback: () => void): void
      show(): void
      hide(): void
      enable(): void
      disable(): void
      showProgress(leaveActive?: boolean): void
      hideProgress(): void
    }
    showAlert(message: string, callback?: () => void): void
    close(): void
    expand(): void
    ready(): void
    sendData(data: string): void
    onEvent(eventType: string, callback: () => void): void
    offEvent(eventType: string, callback: () => void): void
    enableClosingConfirmation(): void
    disableClosingConfirmation(): void
  }

  interface TelegramInitData {
    query_id?: string
    user?: {
      id: number
      first_name: string
      last_name?: string
      username?: string
      language_code?: string
      is_premium?: boolean
      allows_write_to_pm?: boolean
    }
    auth_date: number
    hash: string
  }
}
