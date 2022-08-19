class JsonStylesLoader implements FileStylesLoader {
    constructor(private readonly converter: StyleConverter<JsonWailaStyle>) {
    }

    private static getNameWithoutExt(name: string) {
        const dotIndex = name.lastIndexOf(".");
        return (dotIndex == -1) ? name : name.substring(0, dotIndex);
    }

    private static getExt(name: string) {
        const dotIndex = name.lastIndexOf(".");
        return (dotIndex == -1) ? "" : name.substring(dotIndex);
    }

    load(path: string): Record<string, WailaStyle> {
        const file = new java.io.File(path);
        if (!file.exists()) {
            throw new java.io.FileNotFoundException(`Styles not found: ${path}`);
        }

        const styles: Record<string, WailaStyle> = {};
        if (file.isFile()) {
            if (JsonStylesLoader.getExt(file.getName()) != ".json") {
                throw new FormatNotSupportedException(file.getPath());
            }

            this.loadFromFileTo(file, styles);
        } else {
            const files = file.listFiles();
            for (const key in files) {
                this.loadFromFileTo(files[key], styles);
            }
        }

        return styles;
    }

    private loadFromFileTo(file: java.io.File, to: Record<string, WailaStyle>): void {
        const style = FileTools.ReadJSON(file.getPath()) as Nullable<JsonWailaStyle>;
        if (!style) {
            throw new java.io.IOException(`Unknown error occurred while loading style: ${file.getPath()}`);
        }

        const styleName = JsonStylesLoader.getNameWithoutExt(file.getName());
        if (to[styleName]) {
            throw new java.lang.IllegalStateException(`Style with the name ${styleName} is already loaded`);
        }

        to[styleName] = this.converter.convert(style);
    }
}