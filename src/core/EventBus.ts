import type { EventData, EventName } from './events.js';

type Handler<K extends EventName> = (data: EventData[K]) => void;

export class EventBus {
    private readonly listeners = new Map<EventName, Set<Handler<EventName>>>();

    on<K extends EventName>(event: K, handler: Handler<K>): void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event)!.add(handler as Handler<EventName>);
    }

    off<K extends EventName>(event: K, handler: Handler<K>): void {
        this.listeners.get(event)?.delete(handler as Handler<EventName>);
    }

    emit<K extends EventName>(event: K, data: EventData[K]): void {
        this.listeners.get(event)?.forEach(h => h(data));
    }

    once<K extends EventName>(event: K, handler: Handler<K>): void {
        const wrapper: Handler<K> = (data) => {
            handler(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    clear(): void {
        this.listeners.clear();
    }
}
