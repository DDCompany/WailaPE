class FormatNotSupportedException extends Error {
    constructor(path: string) {
        super(`File format not supported by this loader: ${path}`);
    }
}