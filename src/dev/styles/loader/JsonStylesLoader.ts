class JsonStylesLoader implements FileStylesLoader {
    constructor(private readonly converter: StyleConverter<JsonWailaStyle>) {
    }

    load(path: string): Record<string, WailaStyle> {
        const file = new java.io.File(path);
        if (!file.exists()) {
            Logger.Log(`Styles not found: ${path}`, "WARNING");
            return {};
        }

        const styles: Record<string, WailaStyle> = {};
        if (file.isFile()) {
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
            Logger.Log(`Unknown error occurred while loading style: ${file.getPath()}`, "ERROR");
            return null;
        }

        const styleName = JsonStylesLoader.getNameWithoutExt(file.getName());
        if (to[styleName]) {
            Logger.Log(`Style duplication: ${styleName}`, "ERROR");
        }

        to[styleName] = this.converter.convert(style);
    }

    private static getNameWithoutExt(name: string) {
        const dotIndex = name.lastIndexOf('.');
        return (dotIndex == -1) ? name : name.substring(0, dotIndex);
    }
}