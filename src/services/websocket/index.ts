import { Config } from '../../config';
import { WEBSOCKET_RECONNECT_DELAY, WEBSOCKET_MAX_RETRIES } from '../../constants';
import { StockPrice } from '../../types';

type PriceUpdateCallback = (symbol: string, price: StockPrice) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected' | 'error') => void;

class WebSocketManager {
  private ws: WebSocket | null = null;
  private subscriptions = new Set<string>();
  private priceCallbacks: PriceUpdateCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private retryCount = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private isIntentionalClose = false;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;
    this.isIntentionalClose = false;
    this._createConnection();
  }

  private _createConnection(): void {
    try {
      this.ws = new WebSocket(`${Config.WS_BASE_URL}/ws/prices`);

      this.ws.onopen = () => {
        this.retryCount = 0;
        this._notifyConnection('connected');
        this._resubscribeAll();
        this._startPing();
      };

      this.ws.onmessage = (event: any) => {
        try {
          const msg = JSON.parse(event.data as string) as {
            type: string;
            symbol: string;
            data: StockPrice;
          };
          if (msg.type === 'price_update') {
            this.priceCallbacks.forEach(cb => cb(msg.symbol, msg.data));
          }
        } catch {}
      };

      this.ws.onerror = () => {
        this._notifyConnection('error');
      };

      this.ws.onclose = () => {
        this._stopPing();
        this._notifyConnection('disconnected');
        if (!this.isIntentionalClose) this._scheduleReconnect();
      };
    } catch {
      this._scheduleReconnect();
    }
  }

  private _scheduleReconnect(): void {
    if (this.retryCount >= WEBSOCKET_MAX_RETRIES) return;
    const delay = WEBSOCKET_RECONNECT_DELAY * Math.pow(2, this.retryCount);
    this.retryTimer = setTimeout(() => {
      this.retryCount += 1;
      this._createConnection();
    }, delay);
  }

  private _startPing(): void {
    this.pingTimer = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
  }

  private _stopPing(): void {
    if (this.pingTimer) { clearInterval(this.pingTimer); this.pingTimer = null; }
  }

  private _resubscribeAll(): void {
    if (this.subscriptions.size === 0) return;
    this._send({ type: 'subscribe', symbols: Array.from(this.subscriptions) });
  }

  private _send(payload: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private _notifyConnection(status: 'connected' | 'disconnected' | 'error'): void {
    this.connectionCallbacks.forEach(cb => cb(status));
  }

  subscribe(symbols: string[]): void {
    symbols.forEach(s => this.subscriptions.add(s));
    this._send({ type: 'subscribe', symbols });
  }

  unsubscribe(symbols: string[]): void {
    symbols.forEach(s => this.subscriptions.delete(s));
    this._send({ type: 'unsubscribe', symbols });
  }

  onPriceUpdate(cb: PriceUpdateCallback): () => void {
    this.priceCallbacks.push(cb);
    return () => { this.priceCallbacks = this.priceCallbacks.filter(c => c !== cb); };
  }

  onConnectionChange(cb: ConnectionCallback): () => void {
    this.connectionCallbacks.push(cb);
    return () => { this.connectionCallbacks = this.connectionCallbacks.filter(c => c !== cb); };
  }

  disconnect(): void {
    this.isIntentionalClose = true;
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    this._stopPing();
    this.ws?.close();
    this.ws = null;
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
