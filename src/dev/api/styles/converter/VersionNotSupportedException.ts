class VersionNotSupportedException extends Error {
    constructor(version: number | undefined, min: number, actual: number) {
        super(`Version not supported by styles converter (provided = ${version}, min = ${min}, actual = ${actual})`);
    }
}