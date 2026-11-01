import { useEffect, useState } from "react";

const LIST_KEY = "apu_shuttle_notifications";
const SENT_KEY = "apu_shuttle_alerts_sent";
const MAX_ITEMS = 50;
const MAX_SENT = 300;

// Backup in case the browser blocks storage, so an alert is still sent only once
const sentThisSession = new Set();

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Storage can be blocked by the browser, then nothing is saved
  }
}

function emitChange() {
  window.dispatchEvent(new Event("notifications-changed"));
}

export function readNotifications() {
  return readJson(LIST_KEY, []);
}

// Returns true only the first time a key is used, so each alert is sent once
export function claimAlert(key) {
  if (sentThisSession.has(key)) return false;
  const sent = readJson(SENT_KEY, []);
  if (sent.includes(key)) return false;
  sentThisSession.add(key);
  writeJson(SENT_KEY, [...sent, key].slice(-MAX_SENT));
  return true;
}

function showSystemNotification(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }
  try {
    new Notification(title, { body });
  } catch (error) {
    // Some phones do not allow system pop-ups from a web page
  }
}

export function addNotification({ type, title, body, clock }) {
  const item = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    title,
    body,
    clock,
    read: false,
  };
  writeJson(LIST_KEY, [item, ...readNotifications()].slice(0, MAX_ITEMS));
  emitChange();
  showSystemNotification(title, body);
  return item;
}

export function markAllRead() {
  const list = readNotifications();
  if (!list.some((n) => !n.read)) return;
  writeJson(LIST_KEY, list.map((n) => ({ ...n, read: true })));
  emitChange();
}

// Clearing also forgets which alerts were sent, so they can be tested again
export function clearNotifications() {
  sentThisSession.clear();
  writeJson(LIST_KEY, []);
  writeJson(SENT_KEY, []);
  emitChange();
}

export function notificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function requestNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.requestPermission();
}

export function useNotifications() {
  const [list, setList] = useState(readNotifications);

  useEffect(() => {
    const update = () => setList(readNotifications());
    window.addEventListener("notifications-changed", update);
    return () => window.removeEventListener("notifications-changed", update);
  }, []);

  return list;
}