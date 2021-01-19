import { HashFactory, HashMap } from "@aster-js/collections";
import { TopologicalIterator } from "./topological";

export class TopologicalGraph<T> implements Iterable<T>{
    private readonly _nodes: HashMap<T, Set<T>>;

    constructor(hashFactory?: HashFactory<T>) {
        this._nodes = new HashMap(hashFactory);
    }

    *has(node: T): IterableIterator<T> {
        return this._nodes.has(node);
    }

    *get(node: T): IterableIterator<T> {
        let deps = this._nodes.get(node);
        if (deps) yield* deps;
    }

    add(node: T, ...dependencies: T[]): void {
        let deps = this._nodes.get(node);
        if (deps) {
            for (let dep of dependencies) deps.add(dep);
        }
        else {
            this._nodes.set(node, new Set(dependencies));
        }
    }

    delete(node: T): boolean {
        return this._nodes.delete(node);
    }

    clear(): void {
        this._nodes.clear();
    }

    *all(): IterableIterator<T> {
        const results = new Set();
        for (const [key, dependencies] of this._nodes) {
            if (!results.has(key)) {
                results.add(key);
                yield key;
            }
            for (const dep of dependencies) {
                if (!results.has(dep)) {
                    results.add(dep);
                    yield dep;
                }
            }
        }
    }

    [Symbol.iterator](): Iterator<T> {
        return new TopologicalIterator(this.all(), n => this.get(n));
    }
}