/**
 * Class for loading styles from a file or directory.
 *
 * To load styles from json use {@link JsonStylesLoader}.
 */
interface FileStylesLoader {
    /**
     * Loads styles from a file or directory at the specified {@link path}. If a directory is passed, styles are loaded
     * from all files with a supported format (not including subdirectories), otherwise it will be loaded from a single file.
     *
     * @example stylesLoaderInstance.load(\`${\_\_dir\_\_}styles\`);
     * @throws FormatNotSupportedException  - if a path to a single file is passed, and it is not supported by this loader.
     * @throws java.io.FileNotFoundException - if the file at the given path does not exist.
     * @throws java.lang.IllegalStateException - if multiple styles with the same name are defined.
     * @throws java.io.IOException - if an error occurred while reading the file.
     * @returns A map of styles, where the keys are the style names and the values are the styles.
     */
    load(path: string): Record<string, WailaStyle>;
}