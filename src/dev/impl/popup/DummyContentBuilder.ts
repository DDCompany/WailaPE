//TODO: remove in future
class DummyContentBuilder implements PopupContentBuilder {
    private content: string;

    constructor() {
        this.content = ""
    }

    text(options: TextOptions): this {
        this.content += options.value + "\n";
        return this;
    }

    build(): string {
        return this.content;
    }
}