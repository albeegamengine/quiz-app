'use client';

import { v4 as uuidv4 } from 'uuid';

const SESSION_ID_KEY = 'quiz-app-session-id';

/**
 * セッションIDを取得または新規生成する
 * localStorageからセッションIDを取得し、存在しない場合は新規生成してlocalStorageに保存する
 *
 * @returns {string} セッションID
 */
export function getOrCreateSessionId(): string {
  // サーバーサイドレンダリング時はundefinedを返す
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    // localStorageからセッションIDを取得
    const existingSessionId = localStorage.getItem(SESSION_ID_KEY);

    if (existingSessionId) {
      return existingSessionId;
    }

    // セッションIDが存在しない場合は新規生成
    const newSessionId = uuidv4();

    // localStorageに保存
    localStorage.setItem(SESSION_ID_KEY, newSessionId);

    return newSessionId;
  } catch (error) {
    // localStorageが利用できない場合（プライベートブラウジングモードなど）
    console.warn('localStorage is not available:', error);
    // 一時的なセッションIDを生成（保存はしない）
    return uuidv4();
  }
}

/**
 * セッションIDをクリアする（テスト用）
 */
export function clearSessionId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(SESSION_ID_KEY);
  } catch (error) {
    console.warn('Failed to clear session ID:', error);
  }
}

/**
 * セッションIDを手動で設定する（テスト用）
 *
 * @param {string} sessionId - 設定するセッションID
 */
export function setSessionId(sessionId: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  } catch (error) {
    console.warn('Failed to set session ID:', error);
  }
}
