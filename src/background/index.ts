/** Service worker entrypoint for the ChatGPT Interview extension. */
import { isOAuthCallbackUrl, handleOAuthCallback } from '../features/auth';
import { routeRuntimeMessage } from './messageRouter';
import { rebuildContextMenus, onContextMenuClick } from './contextMenus';
import { runFireAndForget } from './taskRunner';

chrome.runtime.onInstalled.addListener(() => {
  runFireAndForget(rebuildContextMenus(), 'onInstalled menus');
});

chrome.runtime.onStartup.addListener(() => {
  runFireAndForget(rebuildContextMenus(), 'onStartup menus');
});

chrome.runtime.onMessage.addListener(routeRuntimeMessage);

chrome.contextMenus.onClicked.addListener(onContextMenuClick);

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.url && isOAuthCallbackUrl(changeInfo.url)) {
    runFireAndForget(
      handleOAuthCallback(changeInfo.url, tabId, () => rebuildContextMenus()),
      'OAuth callback'
    );
  }
});
