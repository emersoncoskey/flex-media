import AVLNode from './AVLNode';
import { CompareFunc } from '../util/CompareFunc';
import { KVP } from '../util/KeyValuePair';
import AVLIterator, { IteratorDirection } from './AVLIterator';

// implemented as a variety of Self Balancing Binary Search Tree called an AVL Tree
export default class AVLTree<K, V> /*implements Iterable<KVP<K, V[]>>*/{
    readonly #compareFunc: CompareFunc<K>;
    #root?: AVLNode<K, V>;

    constructor(compareFunc: CompareFunc<K>, initialItems?: Iterable<KVP<K, V[]>> | null | undefined) {
        this.#compareFunc = compareFunc;

        if (initialItems) {
            for (const item of initialItems) {
                this.insert(item.key, ...item.value);
            }
        }
    }

    verify(): boolean {
        return this.#root?.verify() ?? false;
    }

    get min(): KVP<K, V[]> | undefined {
            const minNode =  this.#root?.min;

            if (minNode) {
                return {
                    key: minNode.key,
                    value: minNode.values,
                };
            }
            return undefined;
        }

    get max(): KVP<K, V[]> | undefined {
        const maxNode =  this.#root?.max;

        if (maxNode) {
            return {
                key: maxNode.key,
                value: maxNode.values,
            };
        }
        return undefined;
    }

    get(key: K): KVP<K, V[]> | undefined {
        return this.#root?.get(key);
    }

    isPopulated(): this is Required<AVLTree<K, V>> {
        return this.#root !== undefined;
    }

    search(key: K, mode: `closest${'-max' | '-min'}`): KVP<K, V[]> | undefined {
        return this.#root?.search(key, mode)?.kvp;
    }

    insert(key: K, ...items: V[]): void {
        if (items.length > 0) {
            this.#root = this.#root?.insert(key, ...items) ?? new AVLNode<K, V>(key, this.#compareFunc, undefined, items);
        }
    }

    delete(key: K): void {
        this.#root = this.#root?.delete(key);
        if (this.#root && !this.#root.verify()) {console.log('delete doesn\'t work lmao');} //TODO: REMOVE LATER WHEN DELETE METHOD WORKS
    }

    clear(): void {
        this.#root = undefined;
    }

    entries(direction: IteratorDirection = 'ascending', startKey?: K): AVLIterator<K, V> {
        let startNode: AVLNode<K, V> | undefined;

        if (startKey) {
            startNode = this.#root?.search(startKey, (direction === 'ascending' ? 'closest-max' : 'closest-min'));
        } else {
            startNode = (direction === 'ascending' ? this.#root?.min : this.#root?.max);
        }

        return new AVLIterator(direction, startNode);
    }

    [Symbol.iterator](): Iterator<KVP<K, V[]>> {
        return this.entries();
    }
}