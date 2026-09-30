// Simple notification utility for better user feedback
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  add(type: NotificationType, message: string, duration: number = 3000): string {
    const id = Math.random().toString(36).substring(2, 9);
    const notification: Notification = { id, type, message, duration };
    
    this.notifications.push(notification);
    this.notifyListeners();
    
    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
    
    return id;
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Convenience methods
  success(message: string, duration?: number): string {
    return this.add('success', message, duration);
  }

  error(message: string, duration?: number): string {
    return this.add('error', message, duration);
  }

  info(message: string, duration?: number): string {
    return this.add('info', message, duration);
  }

  warning(message: string, duration?: number): string {
    return this.add('warning', message, duration);
  }
}

// Global notification manager instance
export const notificationManager = new NotificationManager();

// Convenience functions
export const showSuccess = (message: string, duration?: number) => 
  notificationManager.success(message, duration);

export const showError = (message: string, duration?: number) => 
  notificationManager.error(message, duration);

export const showInfo = (message: string, duration?: number) => 
  notificationManager.info(message, duration);

export const showWarning = (message: string, duration?: number) => 
  notificationManager.warning(message, duration);