/**
 * Waila popup style registration class.
 */
interface StylesRegistry {
    /**
     * All registered styles via the {@link register} method and {@link registerAll}.
     */
    all: Readonly<Record<string, WailaStyle>>;

    /**
     * Register a new style with the given name.
     *
     * The name must be unique. Recommended to use your mod name as prefix (for example, "my_mod:my_style") to avoid
     * duplicates.
     *
     * If you want to register a multiple styles, use {@link registerAll} instead.
     * @throws java.lang.IllegalArgumentException - if the style with the given name is already registered.
     */
    register(name: string, style: WailaStyle): void;

    /**
     * Register all styles from the given map. The map keys are represents the style names.
     *
     * All the given style names must be unique. Recommended to use your mod name as prefix (for example, "my_mod:my_style")
     * to avoid duplicates.
     *
     * If you want to register a single style, use the {@link register} instead.
     * @throws java.lang.IllegalArgumentException - if a style with the same name is already registered.
     */
    registerAll(styles: Record<string, WailaStyle>): void;

    /**
     * Get the style with the given name or null if it is not registered.
     */
    getByName(name: string): Nullable<WailaStyle>;

    /**
     * Loads styles from a file or directory at the specified {@link path}. If a directory is passed, styles are loaded
     * from all files with a supported format (not including subdirectories), otherwise it will be loaded from a single file.
     *
     * @example stylesRegistryInstance.loadFromJson(\`${\_\_dir\_\_}styles\`);
     * @throws java.lang.IllegalArgumentException - if a style with the same name is already registered.
     */
    loadFromJson(path: string): void;
}