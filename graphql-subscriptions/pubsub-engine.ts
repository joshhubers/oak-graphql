import { PubSubAsyncIterator } from "./pubsub-async-iterator.ts";

export abstract class PubSubEngine {
  public abstract publish(triggerName: string, payload: any): Promise<void>;
  public abstract subscribe(
    triggerName: string,
    onMessage: Function,
    options: Object,
  ): Promise<number>;
  public abstract unsubscribe(subId: number): any;
  public asyncIterator<T>(triggers: string | string[]): AsyncIterator<T> {
    return new PubSubAsyncIterator<T>(this, triggers);
  }
}
