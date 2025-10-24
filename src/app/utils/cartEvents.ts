// utils/cartEvents.ts
export class CartEvents {
    static readonly EVENT_NAME = 'cartUpdated';

    static dispatch() {
        window.dispatchEvent(new CustomEvent(this.EVENT_NAME));
    }

    static subscribe(callback: () => void) {
        window.addEventListener(this.EVENT_NAME, callback);
        return () => window.removeEventListener(this.EVENT_NAME, callback);
    }
}