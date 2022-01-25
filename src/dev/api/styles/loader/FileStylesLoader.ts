interface FileStylesLoader {
    load(path: string): Record<string, WailaStyle>;
}