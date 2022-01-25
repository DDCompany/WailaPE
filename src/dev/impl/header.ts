const colorToIntCompiler = new AnyColorToIntCompiler();
const styleConverter = new JsonStyleConverter(colorToIntCompiler);
const stylesLoader = new JsonStylesLoader(styleConverter);
const stylesRepo = new WailaStylesRepository();

stylesRepo.registerAll(stylesLoader.load(`${__dir__}styles`));
Debug.big(stylesRepo.getAll());