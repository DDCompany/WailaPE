interface StylesRepository<T> {
    register(name: string, style: T): void;

    registerAll(styles: Record<string, T>): void;

    getByName(name: string): Nullable<T>;

    getAll(): Record<string, T>;
}