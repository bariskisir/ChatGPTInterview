/** Creates and routes extension context-menu actions. */
import { isLoggedIn, startLogin } from '../features/auth';
import { openAssistant } from '../features/assistant';
import { runFireAndForget } from './taskRunner';

const CONTEXT_MENU_ITEMS = {
  loggedOut: [
    {
      id: 'login',
      title: 'Log in to ChatGPT',
      contexts: ['page', 'selection']
    }
  ],
  loggedIn: [
    {
      id: 'openAssistant',
      title: 'Open ChatGPT Interview',
      contexts: ['page', 'selection']
    }
  ]
} satisfies Record<'loggedOut' | 'loggedIn', chrome.contextMenus.CreateProperties[]>;

/** Rebuilds context menus to match the current authentication state. */
export async function rebuildContextMenus(): Promise<void> {
  const loggedIn = await isLoggedIn();
  await removeAllMenus();

  for (const item of getContextMenuItems(loggedIn)) {
    chrome.contextMenus.create(item);
  }
}

/** Routes context-menu clicks to login, ask, or scan actions. */
export function onContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab): void {
  switch (info.menuItemId) {
    case 'login':
      runFireAndForget(startLogin(), 'Context menu "login"');
      return;
    case 'openAssistant':
      runFireAndForget(openAssistant(tab), 'Context menu "openAssistant"');
      return;
    default:
      return;
  }
}

/** Returns the context-menu set appropriate for the current session state. */
function getContextMenuItems(loggedIn: boolean): chrome.contextMenus.CreateProperties[] {
  return loggedIn ? CONTEXT_MENU_ITEMS.loggedIn : CONTEXT_MENU_ITEMS.loggedOut;
}

/** Clears all existing context menus before recreating them. */
function removeAllMenus(): Promise<void> {
  return new Promise((resolve) => chrome.contextMenus.removeAll(() => resolve()));
}
