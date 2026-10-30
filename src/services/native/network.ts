/**
 * Network Status Service
 * Tracks online/offline connectivity with support for manual simulation toggle in development
 */

type NetworkListener = (isOnline: boolean) => void;

class NetworkService {
  private isSimulatedOffline: boolean = false;
  private listeners: Set<NetworkListener> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.notify());
      window.addEventListener('offline', () => this.notify());
    }
  }

  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      return navigator.onLine;
    }
    return true;
  }

  public setSimulatedOffline(simulated: boolean) {
    this.isSimulatedOffline = simulated;
    this.notify();
  }

  public getIsSimulated(): boolean {
    return this.isSimulatedOffline;
  }

  public subscribe(listener: NetworkListener): () => void {
    this.listeners.add(listener);
    listener(this.isOnline());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const status = this.isOnline();
    this.listeners.forEach((listener) => listener(status));
  }
}

export const networkService = new NetworkService();
