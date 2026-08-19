const dict: Record<string, Record<string, string>> = {
  en: {
    "shell.search": "Search KebuGram",
    "shell.notifications": "Notifications",
    "kebuchat.searchChats": "Search chats",
    "common.loading": "Loading...",
    "common.empty": "Nothing here yet",
  },
};

let locale = "en";

export function t(key: string, fallback?: string): string {
  return dict[locale]?.[key] ?? fallback ?? key;
}

export function setLocale(l: string) {
  locale = l;
}
