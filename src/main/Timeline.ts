import AVLIterator from '../binarySearchTree/AVLIterator';
import AVLTree from '../binarySearchTree/AVLTree';
import { KVP } from '../util/KeyValuePair';
import compareNums from './compareNums';
import { Marker } from './Marker';

export default class Timeline<TTimelineEvent> {
    readonly #timelineData: AVLTree<number, TTimelineEvent>;
    readonly #markers: Marker[];

    #timelineIterator: AVLIterator<number, TTimelineEvent>;
    #currentTimeout: NodeJS.Timeout | undefined; // setTimeout() returns a numeric timer id that allows you to cancel it

    #globalStartTime: number;
    #localStartTime: number;

    #paused: boolean;
    #reversed: boolean;

    constructor(initialItems: Iterable<KVP<number, TTimelineEvent[]>>) {
        this.#timelineData = new AVLTree<number, TTimelineEvent>(compareNums, initialItems);

        this.#timelineIterator = this.#timelineData.entries();

        this.#globalStartTime = performance.now();
        this.#localStartTime = 0;

        this.#paused = false;
        this.#reversed = false;

        this.#markers = [];
    }

    get currentTime(): number {
        if (this.#paused) { return this.#localStartTime; }

        const dt: number = performance.now() - this.#globalStartTime;
        const currentLocalTime: number = !this.#reversed ? this.#localStartTime + dt : this.#localStartTime - dt;

        return currentLocalTime;
    }

    get timeUntilNext(): number { // time until the next Instant, and the events occuring at that time
        return (this.#timelineIterator.current ? this.#timelineIterator.current.key - this.currentTime : 0);
    }

    setPlayState(paused: boolean): void {
        if (this.#paused && !paused) { //resuming playback
            this.#paused = paused;
            this.#globalStartTime = performance.now();

            const advanceToNext = () => {
                const currentInstant: KVP<number, TTimelineEvent[]> = this.#timelineIterator.current.value as KVP<number, TTimelineEvent[]>;
                const nextInstant: KVP<number, TTimelineEvent[]> | undefined = this.#timelineIterator.next().value;
                //TODO: Dispatch events to listeners

                if (nextInstant) {

                    this.#currentTimeout = setTimeout(advanceToNext, this.timeUntilNext);
                }
            };

            advanceToNext();
        }

        if (!this.#paused && paused) { //pausing playback
            this.#localStartTime = this.currentTime;
            this.#paused = paused;

            if (this.#currentTimeout) { // ! *should* always be defined when this method is called, as this is the only thing removing it.
                clearTimeout(this.#currentTimeout); 
                this.#currentTimeout = undefined;
            } 
        }
        /*
        - only update if there is a difference
        - if resuming playback:
            - get new currentStartTime to properly calculate time passage
            - use current iterator (will have been regenerated by seek() or setPlayDirection() either way)
            - make new setTimeout handler to advance iterator when complete, and call all handlers
        - if pausing playback:
            - cancel current setTimout handler
        */
    }

    setPlayDirection(reversed: boolean): void {

    }
} 