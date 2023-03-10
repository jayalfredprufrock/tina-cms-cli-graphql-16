var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __objRest = (source, exclude) => {
  var target = {};
  for (var prop in source)
    if (__hasOwnProp.call(source, prop) && exclude.indexOf(prop) < 0)
      target[prop] = source[prop];
  if (source != null && __getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(source)) {
      if (exclude.indexOf(prop) < 0 && __propIsEnum.call(source, prop))
        target[prop] = source[prop];
    }
  return target;
};
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[Object.keys(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  __markAsModule(target);
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/utils/index.ts
var parseMediaFolder;
var init_utils = __esm({
  "src/utils/index.ts"() {
    parseMediaFolder = (str) => {
      let returnString = str;
      if (returnString.startsWith("/"))
        returnString = returnString.substr(1);
      if (returnString.endsWith("/"))
        returnString = returnString.substr(0, returnString.length - 1);
      return returnString;
    };
  }
});

// src/server/models/media.ts
var import_fs_extra7, import_path9, MediaModel;
var init_media = __esm({
  "src/server/models/media.ts"() {
    import_fs_extra7 = __toModule(require("fs-extra"));
    import_path9 = __toModule(require("path"));
    init_utils();
    MediaModel = class {
      constructor({ publicFolder, mediaRoot }) {
        this.mediaRoot = mediaRoot;
        this.publicFolder = publicFolder;
      }
      async listMedia(args) {
        try {
          const folderPath = (0, import_path9.join)(this.publicFolder, this.mediaRoot, args.searchPath);
          const searchPath = parseMediaFolder(args.searchPath);
          const filesStr = await import_fs_extra7.default.readdir(folderPath);
          const filesProm = filesStr.map(async (file) => {
            const filePath = (0, import_path9.join)(folderPath, file);
            const stat = await import_fs_extra7.default.stat(filePath);
            let src = `/${file}`;
            const isFile = stat.isFile();
            if (!isFile) {
              return {
                isFile,
                size: stat.size,
                src,
                filename: file
              };
            }
            if (searchPath) {
              src = `/${searchPath}${src}`;
            }
            if (this.mediaRoot) {
              src = `/${this.mediaRoot}${src}`;
            }
            return {
              isFile,
              size: stat.size,
              src,
              filename: file
            };
          });
          const offset = Number(args.cursor) || 0;
          const limit = Number(args.limit) || 20;
          const rawItems = await Promise.all(filesProm);
          const sortedItems = rawItems.sort((a, b) => {
            if (a.isFile && !b.isFile) {
              return 1;
            }
            if (!a.isFile && b.isFile) {
              return -1;
            }
            return 0;
          });
          const limitItems = sortedItems.slice(offset, offset + limit);
          const files = limitItems.filter((x) => x.isFile);
          const directories = limitItems.filter((x) => !x.isFile).map((x) => x.src);
          const cursor = rawItems.length > offset + limit ? String(offset + limit) : null;
          return {
            files,
            directories,
            cursor
          };
        } catch (error) {
          console.error(error);
          return {
            files: [],
            directories: [],
            error: error == null ? void 0 : error.toString()
          };
        }
      }
      async deleteMedia(args) {
        try {
          const file = (0, import_path9.join)(this.publicFolder, this.mediaRoot, args.searchPath);
          await import_fs_extra7.default.stat(file);
          await import_fs_extra7.default.remove(file);
          return { ok: true };
        } catch (error) {
          console.error(error);
          return { ok: false, message: error == null ? void 0 : error.toString() };
        }
      }
    };
  }
});

// src/server/routes/index.ts
var import_express, import_path10, import_multer, createMediaRouter;
var init_routes = __esm({
  "src/server/routes/index.ts"() {
    import_express = __toModule(require("express"));
    import_path10 = __toModule(require("path"));
    import_multer = __toModule(require("multer"));
    init_media();
    createMediaRouter = (config2) => {
      const mediaFolder = (0, import_path10.join)(process.cwd(), config2.publicFolder, config2.mediaRoot);
      const storage = import_multer.default.diskStorage({
        destination: function(req, file, cb) {
          cb(null, mediaFolder);
        },
        filename: function(req, _file, cb) {
          const file = req.params[0];
          cb(null, file);
        }
      });
      const upload = (0, import_multer.default)({ storage });
      const uploadRoute = upload.single("file");
      const mediaModel = new MediaModel(config2);
      const mediaRouter = (0, import_express.Router)();
      mediaRouter.get("/list/*", async (req, res) => {
        const folder = req.params[0];
        const cursor = req.query.cursor;
        const limit = req.query.limit;
        const media = await mediaModel.listMedia({
          searchPath: folder,
          cursor,
          limit
        });
        res.json(media);
      });
      mediaRouter.delete("/*", async (req, res) => {
        const file = req.params[0];
        const didDelete = await mediaModel.deleteMedia({ searchPath: file });
        res.json(didDelete);
      });
      mediaRouter.post("/upload/*", async function(req, res) {
        await uploadRoute(req, res, (err) => {
          if (err instanceof import_multer.default.MulterError) {
            res.status(500).json({ message: err.message });
          } else if (err) {
            res.status(500).json({ message: err.message });
          } else {
            res.json({ success: true });
          }
        });
      });
      return mediaRouter;
    };
  }
});

// src/server/server.ts
var import_cors, import_http, import_express2, import_altair_express_middleware, import_body_parser, gqlServer;
var init_server = __esm({
  "src/server/server.ts"() {
    import_cors = __toModule(require("cors"));
    import_http = __toModule(require("http"));
    import_express2 = __toModule(require("express"));
    import_altair_express_middleware = __toModule(require("altair-express-middleware"));
    import_body_parser = __toModule(require("body-parser"));
    init_routes();
    init_utils();
    gqlServer = async (database, verbose) => {
      var _a, _b, _c;
      const gqlPackage = require("@tinacms/graphql");
      const app = (0, import_express2.default)();
      const server = import_http.default.createServer(app);
      app.use((0, import_cors.default)());
      app.use(import_body_parser.default.json());
      app.use("/altair", (0, import_altair_express_middleware.altairExpress)({
        endpointURL: "/graphql",
        initialQuery: `# Welcome to Tina!
      # We've got a simple query set up for you to get started
      # but there's plenty more for you to explore on your own!
      query MyQuery {
        collections {
          documents {
            id
            sys {
              filename
              extension
            }
          }
        }
      }`
      }));
      app.post("/graphql", async (req, res) => {
        const { query, variables } = req.body;
        const config2 = {
          useRelativeMedia: true
        };
        const result = await gqlPackage.resolve({
          config: config2,
          database,
          query,
          variables,
          verbose
        });
        return res.json(result);
      });
      const db = database;
      const schema = await db.getSchema();
      const mediaPaths = (_c = (_b = (_a = schema == null ? void 0 : schema.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.media) == null ? void 0 : _c.tina;
      app.use("/media", createMediaRouter({
        publicFolder: parseMediaFolder((mediaPaths == null ? void 0 : mediaPaths.publicFolder) || ""),
        mediaRoot: parseMediaFolder((mediaPaths == null ? void 0 : mediaPaths.mediaRoot) || "")
      }));
      return server;
    };
  }
});

// src/server/index.ts
var init_server2 = __esm({
  "src/server/index.ts"() {
    init_server();
  }
});

// src/cmds/start-server/server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
var server_default;
var init_server3 = __esm({
  "src/cmds/start-server/server.ts"() {
    init_server2();
    server_default = gqlServer;
  }
});

// src/index.ts
__export(exports, {
  defineSchema: () => defineSchema,
  init: () => init
});
var commander = __toModule(require("commander"));

// package.json
var name = "@tinacms/cli";
var version = "1.0.5";

// src/cmds/audit/audit.ts
var import_graphql = __toModule(require("@tinacms/graphql"));
var import_path = __toModule(require("path"));

// src/logger/index.ts
var import_log4js = __toModule(require("log4js"));
var logger = import_log4js.default.getLogger();
import_log4js.default.configure({
  appenders: {
    out: { type: "stdout", layout: { type: "messagePassThrough" } }
  },
  categories: { default: { appenders: ["out"], level: "info" } }
});
logger.level = "info";

// src/cmds/audit/audit.ts
var import_graphql2 = __toModule(require("@tinacms/graphql"));
var import_chalk = __toModule(require("chalk"));
var auditDocuments = async (args) => {
  const { collection, database, useDefaultValues, documents } = args;
  let error = false;
  for (let i = 0; i < documents.length; i++) {
    const node = documents[i].node;
    const relativePath = node.path.replace(`${collection.path}/`, "");
    const documentQuery = `query {
        document(collection: "${collection.name}", relativePath: "${relativePath}") {
          __typename
          ...on Document {
            _values
          }
        }
      }`;
    const docResult = await (0, import_graphql.resolve)({
      database,
      query: documentQuery,
      variables: {},
      silenceErrors: true,
      verbose: args.verbose || false,
      isAudit: true
    });
    if (docResult.errors) {
      error = true;
      docResult.errors.forEach((err) => {
        logger.error(import_chalk.default.red(err.message));
        if (err.originalError.originalError) {
          logger.error(import_chalk.default.red(`    ${err.originalError.originalError.message}`));
        }
      });
    } else {
      const topLevelDefaults = {};
      if (useDefaultValues && typeof collection.fields !== "string") {
        collection.fields.filter((x) => !x.list).forEach((x) => {
          const value = x.ui;
          if (typeof value !== "undefined") {
            topLevelDefaults[x.name] = value.defaultValue;
          }
        });
      }
      const params = transformDocumentIntoMutationRequestPayload(docResult.data.document._values, {
        includeCollection: true,
        includeTemplate: typeof collection.templates !== "undefined"
      }, topLevelDefaults);
      const mutation = `mutation($collection: String!, $relativePath: String!, $params: DocumentMutation!) {
        updateDocument(
          collection: $collection,
          relativePath: $relativePath,
          params: $params
        ){__typename}
      }`;
      const mutationRes = await (0, import_graphql.resolve)({
        database,
        query: mutation,
        variables: {
          params,
          collection: collection.name,
          relativePath
        },
        isAudit: true,
        silenceErrors: true,
        verbose: args.verbose || false
      });
      if (mutationRes.errors) {
        mutationRes.errors.forEach((err) => {
          error = true;
          logger.error(import_chalk.default.red(err.message));
        });
      }
    }
  }
  return error;
};
var transformDocumentIntoMutationRequestPayload = (document, instructions, defaults) => {
  const _a = document, { _collection, __typename, _template } = _a, rest = __objRest(_a, ["_collection", "__typename", "_template"]);
  const params = transformParams(rest);
  const paramsWithTemplate = instructions.includeTemplate ? { [_template]: params } : params;
  return instructions.includeCollection ? { [_collection]: __spreadValues(__spreadValues({}, defaults), filterObject(paramsWithTemplate)) } : __spreadValues(__spreadValues({}, defaults), filterObject(paramsWithTemplate));
};
var transformParams = (data) => {
  if (["string", "number", "boolean"].includes(typeof data)) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => transformParams(item));
  }
  try {
    (0, import_graphql2.assertShape)(data, (yup) => yup.object({ _template: yup.string().required() }));
    const _a = data, { _template, __typename } = _a, rest = __objRest(_a, ["_template", "__typename"]);
    const nested = transformParams(rest);
    return { [_template]: nested };
  } catch (e) {
    if (e.message === "Failed to assertShape - _template is a required field") {
      if (!data) {
        return void 0;
      }
      const accum = {};
      Object.entries(data).map(([keyName, value]) => {
        accum[keyName] = transformParams(value);
      });
      return accum;
    } else {
      if (!data) {
        return void 0;
      }
      throw e;
    }
  }
};
function filterObject(obj) {
  const ret = {};
  Object.keys(obj).filter((key) => obj[key] !== void 0).forEach((key) => ret[key] = obj[key]);
  return ret;
}

// src/cmds/audit/index.ts
var import_chalk3 = __toModule(require("chalk"));
var import_prompts = __toModule(require("prompts"));
var import_metrics = __toModule(require("@tinacms/metrics"));

// src/utils/theme.ts
var import_chalk2 = __toModule(require("chalk"));
var successText = import_chalk2.default.bold.green;
var focusText = import_chalk2.default.bold;
var dangerText = import_chalk2.default.bold.red;
var neutralText = import_chalk2.default.bold.cyan;
var linkText = import_chalk2.default.bold.cyan;
var labelText = import_chalk2.default.bold;
var cmdText = import_chalk2.default.inverse;
var indentedCmd = (str) => {
  return `  \u2503 ` + str;
};
var logText = import_chalk2.default.italic.gray;
var warnText = import_chalk2.default.yellowBright.bgBlack;
var titleText = import_chalk2.default.bgHex("d2f1f8").hex("ec4816");
var CONFIRMATION_TEXT = import_chalk2.default.dim("enter to confirm");

// src/cmds/audit/index.ts
var rootPath = process.cwd();
var audit = async (ctx, next, options) => {
  const telemetry = new import_metrics.Telemetry({ disabled: options.noTelemetry });
  await telemetry.submitRecord({
    event: {
      name: "tinacms:cli:audit:invoke",
      clean: Boolean(options.clean),
      useDefaults: Boolean(options.useDefaultValues)
    }
  });
  if (options.clean) {
    logger.info(`You are using the \`--clean\` option. This will modify your content as if a user is submitting a form. Before running this you should have a ${import_chalk3.default.bold("clean git tree")} so unwanted changes can be undone.

`);
    const res = await (0, import_prompts.default)({
      name: "useClean",
      type: "confirm",
      message: `Do you want to continue?`
    });
    if (!res.useClean) {
      logger.warn(import_chalk3.default.yellowBright("\u26A0\uFE0F Audit not complete"));
      process.exit(0);
    }
  }
  if (options.useDefaultValues && !options.clean) {
    logger.warn(import_chalk3.default.yellowBright("WARNING: using the `--useDefaultValues` without the `--clean` flag has no effect. Please re-run audit and add the `--clean` flag"));
  }
  const database = ctx.database;
  const schema = await database.getSchema();
  const collections = schema.getCollections();
  let error = false;
  for (let i = 0; i < collections.length; i++) {
    const collection = collections[i];
    const docs = await database.query({ collection: collection.name, first: -1, filterChain: [] }, (item) => ({ path: item }));
    logger.info(`Checking ${neutralText(collection.name)} collection`);
    const returnError = await auditDocuments({
      collection,
      database,
      rootPath,
      useDefaultValues: options.useDefaultValues,
      documents: docs.edges,
      verbose: ctx.verbose
    });
    error = error || returnError;
  }
  ctx.error = error;
  next();
};
var printFinalMessage = async (ctx, next, _options) => {
  if (ctx.error) {
    logger.error(import_chalk3.default.redBright(`\u203C\uFE0F Audit ${import_chalk3.default.bold("failed")} with errors`));
  } else if (ctx.warning) {
    logger.warn(import_chalk3.default.yellowBright("\u26A0\uFE0F Audit passed with warnings"));
  } else {
    logger.info(import_chalk3.default.greenBright("\u2705 Audit passed"));
  }
  next();
};

// src/cmds/baseCmds.ts
var import_config2 = __toModule(require("dotenv/config"));

// src/middleware.ts
var chain = async (cmds, options) => {
  const ctx = {};
  const next = async (middlewareIndex) => {
    if (middlewareIndex >= cmds.length) {
      process.exit(0);
    }
    try {
      await cmds[middlewareIndex](ctx, () => next(middlewareIndex + 1), options || {});
    } catch (err) {
      console.error(`  ${dangerText(err)}`);
      if (err.stack) {
        console.log(err.stack);
      }
      process.exit(1);
    }
  };
  if (cmds.length > 0) {
    await next(0);
  }
};

// src/cmds/baseCmds.ts
var import_chalk4 = __toModule(require("chalk"));

// src/cmds/start-server/index.ts
var import_path11 = __toModule(require("path"));
var import_chokidar = __toModule(require("chokidar"));
var import_metrics2 = __toModule(require("@tinacms/metrics"));

// src/cmds/start-server/lock.ts
var AsyncLock = class {
  constructor() {
    this.disable = () => {
    };
    this.promise = Promise.resolve();
  }
  enable() {
    this.promise = new Promise((resolve2) => this.disable = resolve2);
  }
};

// src/cmds/start-server/errors/index.ts
var import_graphql3 = __toModule(require("@tinacms/graphql"));
var BuildSchemaError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "BuildSchemaError";
  }
};
var ExecuteSchemaError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "ExecuteSchemaError";
  }
};
var handleServerErrors = (e) => {
  if (e.name === "BuildSchemaError") {
    logger.error(`${dangerText("ERROR: your schema was not successfully built: see https://tina.io/docs/errors/esbuild-error/ for more details")}
  Error Message Below
  ${e}`);
  } else if (e.name === "ExecuteSchemaError") {
    logger.error(`${dangerText("ERROR: your schema was not successfully executed: see https://tina.io/docs/errors/esbuild-error/ for more details")}
  Error Message Below
  ${e}`);
  } else if (e.name === "TinaSchemaValidationError") {
    logger.error(`${dangerText("ERROR: your schema was not successfully validated: see https://tina.io/docs/schema/ for instructions on how to setup a schema")}
  Error Message Below
  ${e}`);
  } else if (e instanceof import_graphql3.TinaFetchError) {
    (0, import_graphql3.handleFetchErrorError)(e, true);
  } else {
    logger.info(dangerText("Compilation failed with errors. Server has not been restarted.") + ` see error below 
 ${e.message}`);
  }
};

// src/buildTina/index.ts
var import_fs_extra6 = __toModule(require("fs-extra"));
var import_graphql9 = __toModule(require("@tinacms/graphql"));
var import_datalayer = __toModule(require("@tinacms/datalayer"));
var import_path8 = __toModule(require("path"));

// src/cmds/compile/index.ts
var _ = __toModule(require("lodash"));
var import_fs_extra2 = __toModule(require("fs-extra"));
var import_path3 = __toModule(require("path"));
var import_esbuild = __toModule(require("esbuild"));

// src/lib/getPath.ts
var import_path2 = __toModule(require("path"));
var import_fs_extra = __toModule(require("fs-extra"));
var fileExists = ({
  projectDir,
  filename,
  allowedTypes
}) => {
  if (!import_fs_extra.default.existsSync(projectDir)) {
    return false;
  }
  const filePaths = allowedTypes.map((ext) => import_path2.default.join(projectDir, `${filename}.${ext}`));
  let inputFile = void 0;
  filePaths.every((path10) => {
    if (import_fs_extra.default.existsSync(path10)) {
      inputFile = path10;
      return false;
    }
    return true;
  });
  return Boolean(inputFile);
};
var getPath = ({
  projectDir,
  filename,
  allowedTypes,
  errorMessage
}) => {
  if (!import_fs_extra.default.existsSync(projectDir)) {
    throw new Error(errorMessage);
  }
  const filePaths = allowedTypes.map((ext) => import_path2.default.join(projectDir, `${filename}.${ext}`));
  let inputFile = void 0;
  filePaths.every((path10) => {
    if (import_fs_extra.default.existsSync(path10)) {
      inputFile = path10;
      return false;
    }
    return true;
  });
  if (!inputFile) {
    throw new Error(errorMessage);
  }
  return inputFile;
};

// src/cmds/compile/index.ts
var generatedFilesToRemove = [
  "_graphql.json",
  "__lookup.json",
  "__schema.json",
  "frags.gql",
  "queries.gql",
  "schema.gql",
  "db"
];
var resetGeneratedFolder = async ({
  tinaGeneratedPath,
  usingTs,
  isBuild
}) => {
  try {
    if (isBuild) {
      await import_fs_extra2.default.emptyDir(tinaGeneratedPath);
    } else {
      for (let index = 0; index < generatedFilesToRemove.length; index++) {
        const file = generatedFilesToRemove[index];
        if (file === "db") {
          try {
            await import_fs_extra2.default.remove(import_path3.default.join(tinaGeneratedPath, file));
          } catch (_e) {
          }
        } else {
          await import_fs_extra2.default.remove(import_path3.default.join(tinaGeneratedPath, file));
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
  await import_fs_extra2.default.mkdirp(tinaGeneratedPath);
  const ext = usingTs ? "ts" : "js";
  if (!await import_fs_extra2.default.pathExists(import_path3.default.join(tinaGeneratedPath, `types.${ext}`))) {
    await import_fs_extra2.default.writeFile(import_path3.default.join(tinaGeneratedPath, `types.${ext}`), `
      export const queries = (client)=>({})
      `);
  }
  if (!await import_fs_extra2.default.pathExists(import_path3.default.join(tinaGeneratedPath, `client.${ext}`))) {
    await import_fs_extra2.default.writeFile(import_path3.default.join(tinaGeneratedPath, `client.${ext}`), `
export const client = ()=>{}
export default client
`);
  }
  await import_fs_extra2.default.outputFile(import_path3.default.join(tinaGeneratedPath, ".gitignore"), `app
db
prebuild
client.ts
client.js
types.ts
types.js
types.d.ts
frags.gql
queries.gql
schema.gql
out.jsx
`);
};
var cleanup = async ({ tinaTempPath }) => {
  await import_fs_extra2.default.remove(tinaTempPath);
};
var compileFile = async (options, fileName) => {
  const root2 = options.rootPath;
  if (!root2) {
    throw new Error("ctx.rootPath has not been attached");
  }
  const tinaPath = import_path3.default.join(root2, ".tina");
  const tsConfigPath = import_path3.default.join(root2, "tsconfig.json");
  const tinaGeneratedPath = import_path3.default.join(tinaPath, "__generated__");
  const tinaTempPath = import_path3.default.join(tinaGeneratedPath, `temp_${fileName}`);
  const packageJSONFilePath = import_path3.default.join(root2, "package.json");
  if (!options.schemaFileType) {
    const usingTs = await import_fs_extra2.default.pathExists(tsConfigPath);
    options = __spreadProps(__spreadValues({}, options), { schemaFileType: usingTs ? "ts" : "js" });
  }
  if (options.verbose) {
    logger.info(logText(`Compiling ${fileName}...`));
  }
  const { schemaFileType: requestedSchemaFileType = "ts" } = options;
  const schemaFileType2 = (requestedSchemaFileType === "ts" || requestedSchemaFileType === "tsx") && "ts" || (requestedSchemaFileType === "js" || requestedSchemaFileType === "jsx") && "js";
  if (!schemaFileType2) {
    throw new Error(`Requested schema file type '${requestedSchemaFileType}' is not valid. Supported schema file types: 'ts, js, tsx, jsx'`);
  }
  try {
    const define = {};
    if (!process.env.NODE_ENV) {
      define["process.env.NODE_ENV"] = options.dev ? '"development"' : '"production"';
    }
    const inputFile = getPath({
      projectDir: tinaPath,
      filename: fileName,
      allowedTypes: ["js", "jsx", "tsx", "ts"],
      errorMessage: `Must provide a ${fileName}.{js,jsx,tsx,ts}`
    });
    await transpile(inputFile, `${fileName}.cjs`, tinaTempPath, options.verbose, define, packageJSONFilePath);
  } catch (e) {
    await cleanup({ tinaTempPath });
    throw new BuildSchemaError(e);
  }
  Object.keys(require.cache).map((key) => {
    if (key.startsWith(tinaTempPath)) {
      delete require.cache[require.resolve(key)];
    }
  });
  let returnObject = {};
  try {
    const schemaFunc = require(import_path3.default.join(tinaTempPath, `${fileName}.cjs`));
    returnObject = schemaFunc.default;
    await cleanup({ tinaTempPath });
  } catch (e) {
    await cleanup({ tinaTempPath });
    if (e instanceof Error) {
      if (e.name === "TinaSchemaValidationError") {
        throw e;
      }
    }
    throw new ExecuteSchemaError(e);
  }
  return returnObject;
};
var compileSchema = async (options) => {
  const root2 = options.rootPath;
  const tinaPath = import_path3.default.join(root2, ".tina");
  const tinaGeneratedPath = import_path3.default.join(tinaPath, "__generated__");
  const tinaConfigPath = import_path3.default.join(tinaGeneratedPath, "config");
  const schemaExists = fileExists({
    projectDir: tinaPath,
    filename: "schema",
    allowedTypes: ["js", "jsx", "tsx", "ts"]
  });
  const configExists = fileExists({
    projectDir: tinaPath,
    filename: "config",
    allowedTypes: ["js", "jsx", "tsx", "ts"]
  });
  if (!schemaExists && !configExists) {
    throw new Error("No schema or config file found in .tina folder. Please run `npx @tinacms/cli@latest init` to generate a schema file.");
  }
  let schema;
  if (schemaExists && !configExists) {
    console.warn(`schema.{ts,tsx,js,jsx} will soon be deprecated, in favor of the new config.{ts,tsx,js,jsx}
See here for migration steps, see here: https://tina.io/blog/upgrading-to-iframe`);
    schema = await compileFile(options, "schema");
  }
  if (configExists) {
    const config2 = await compileFile(options, "config");
    const configCopy = _.cloneDeep(config2);
    delete configCopy.schema;
    if (config2 == null ? void 0 : config2.schema) {
      schema = __spreadProps(__spreadValues({}, config2.schema), { config: configCopy });
    }
  }
  await import_fs_extra2.default.outputFile(import_path3.default.join(tinaConfigPath, `schema.json`), JSON.stringify(schema, null, 2));
  return schema;
};
var transpile = async (inputFile, outputFile, tempDir, verbose, define, packageJSONFilePath) => {
  if (verbose)
    logger.info(logText("Building javascript..."));
  const packageJSON = JSON.parse(import_fs_extra2.default.readFileSync(packageJSONFilePath).toString() || "{}");
  const deps = (packageJSON == null ? void 0 : packageJSON.dependencies) || [];
  const peerDeps = (packageJSON == null ? void 0 : packageJSON.peerDependencies) || [];
  const devDeps = (packageJSON == null ? void 0 : packageJSON.devDependencies) || [];
  const external = Object.keys(__spreadValues(__spreadValues(__spreadValues({}, deps), peerDeps), devDeps));
  const prebuiltInputPath = import_path3.default.join(tempDir, "temp-output.jsx");
  await (0, import_esbuild.build)({
    bundle: true,
    platform: "neutral",
    target: ["es2020"],
    entryPoints: [inputFile],
    treeShaking: true,
    external: [...external, "./node_modules/*"],
    loader: loaders,
    outfile: prebuiltInputPath,
    define
  });
  const tempTsConfigPath = import_path3.default.join(tempDir, "temp-tsconfig.json");
  await import_fs_extra2.default.outputFileSync(tempTsConfigPath, "{}");
  const outputPath = import_path3.default.join(tempDir, outputFile);
  await (0, import_esbuild.build)({
    bundle: true,
    platform: "neutral",
    target: ["node10.4"],
    entryPoints: [prebuiltInputPath],
    format: "cjs",
    treeShaking: true,
    external: [...external, "./node_modules/*"],
    tsconfig: tempTsConfigPath,
    loader: loaders,
    outfile: outputPath,
    define
  });
  if (verbose)
    logger.info(logText(`Javascript built`));
};
var defineSchema = (config2) => {
  return config2;
};
var loaders = {
  ".aac": "file",
  ".css": "file",
  ".eot": "file",
  ".flac": "file",
  ".gif": "file",
  ".jpeg": "file",
  ".jpg": "file",
  ".json": "json",
  ".mp3": "file",
  ".mp4": "file",
  ".ogg": "file",
  ".otf": "file",
  ".png": "file",
  ".svg": "file",
  ".ttf": "file",
  ".wav": "file",
  ".webm": "file",
  ".webp": "file",
  ".woff": "file",
  ".woff2": "file",
  ".js": "jsx",
  ".jsx": "jsx",
  ".tsx": "tsx"
};

// src/cmds/query-gen/genTypes.ts
var import_graphql8 = __toModule(require("graphql"));
var import_fs_extra3 = __toModule(require("fs-extra"));
var import_path5 = __toModule(require("path"));

// src/codegen/index.ts
var import_graphql7 = __toModule(require("graphql"));

// src/codegen/plugin.ts
var AddGeneratedClientFunc = (_schema, _documents, _config, _info) => {
  return `
// TinaSDK generated code
import { createClient, TinaClient } from "tinacms/dist/client";

const generateRequester = (client: TinaClient) => {
  const requester: (
    doc: any,
    vars?: any,
    options?: any,
    client
  ) => Promise<any> = async (doc, vars, _options) => {
    const data = await client.request({
      query: doc,
      variables: vars,
    });

    return { data: data?.data, query: doc, variables: vars || {} };
  };

  return requester;
};

/**
 * @experimental this class can be used but may change in the future
 **/
export const ExperimentalGetTinaClient = () =>
  getSdk(
    generateRequester(createClient({ url: "http://localhost:4001/graphql", queries }))
  );

export const queries = (client: TinaClient) => {
  const requester = generateRequester(client);
  return getSdk(requester);
};
`;
};
var AddGeneratedClient = {
  plugin: AddGeneratedClientFunc
};

// src/codegen/index.ts
var import_graphql_file_loader = __toModule(require("@graphql-tools/graphql-file-loader"));
var import_core = __toModule(require("@graphql-codegen/core"));
var import_load = __toModule(require("@graphql-tools/load"));
var import_typescript_operations = __toModule(require("@graphql-codegen/typescript-operations"));
var import_typescript = __toModule(require("@graphql-codegen/typescript"));

// src/codegen/sdkPlugin/index.ts
var import_graphql5 = __toModule(require("graphql"));
var import_graphql6 = __toModule(require("graphql"));
var import_path4 = __toModule(require("path"));

// src/codegen/sdkPlugin/visitor.ts
var import_visitor_plugin_common = __toModule(require("@graphql-codegen/visitor-plugin-common"));
var import_plugin_helpers = __toModule(require("@graphql-codegen/plugin-helpers"));
var import_auto_bind = __toModule(require("auto-bind"));
var import_graphql4 = __toModule(require("graphql"));
var GenericSdkVisitor = class extends import_visitor_plugin_common.ClientSideBaseVisitor {
  constructor(schema, fragments, rawConfig) {
    super(schema, fragments, rawConfig, {
      usingObservableFrom: rawConfig.usingObservableFrom
    });
    this._operationsToInclude = [];
    (0, import_auto_bind.default)(this);
    if (this.config.usingObservableFrom) {
      this._additionalImports.push(this.config.usingObservableFrom);
    }
    if (this.config.documentMode !== import_visitor_plugin_common.DocumentMode.string) {
    }
  }
  buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
    if (node.name == null) {
      throw new Error("Plugin 'generic-sdk' cannot generate SDK for unnamed operation.\n\n" + (0, import_graphql4.print)(node));
    } else {
      this._operationsToInclude.push({
        node,
        documentVariableName,
        operationType,
        operationResultType: `{data: ${operationResultType}, variables: ${operationVariablesTypes}, query: string}`,
        operationVariablesTypes
      });
    }
    return null;
  }
  get sdkContent() {
    const usingObservable = !!this.config.usingObservableFrom;
    const allPossibleActions = this._operationsToInclude.map((o) => {
      const optionalVariables = !o.node.variableDefinitions || o.node.variableDefinitions.length === 0 || o.node.variableDefinitions.every((v) => v.type.kind !== import_graphql4.Kind.NON_NULL_TYPE || v.defaultValue);
      const returnType = usingObservable && o.operationType === "Subscription" ? "Observable" : "Promise";
      return `${o.node.name.value}(variables${optionalVariables ? "?" : ""}: ${o.operationVariablesTypes}, options?: C): ${returnType}<${o.operationResultType}> {
    return requester<${o.operationResultType}, ${o.operationVariablesTypes}>(${o.documentVariableName}, variables, options);
  }`;
    }).map((s) => (0, import_visitor_plugin_common.indentMultiline)(s, 2));
    return `export type Requester<C= {}> = <R, V>(doc: ${this.config.documentMode === import_visitor_plugin_common.DocumentMode.string ? "string" : "DocumentNode"}, vars?: V, options?: C) => ${usingObservable ? "Promise<R> & Observable<R>" : "Promise<R>"}
  export function getSdk<C>(requester: Requester<C>) {
    return {
  ${allPossibleActions.join(",\n")}
    };
  }
  export type Sdk = ReturnType<typeof getSdk>;`;
  }
};

// src/codegen/sdkPlugin/index.ts
var plugin = (schema, documents, config2) => {
  const allAst = (0, import_graphql6.concatAST)(documents.reduce((prev, v) => {
    return [...prev, v.document];
  }, []));
  const allFragments = [
    ...allAst.definitions.filter((d) => d.kind === import_graphql6.Kind.FRAGMENT_DEFINITION).map((fragmentDef) => ({
      node: fragmentDef,
      name: fragmentDef.name.value,
      onType: fragmentDef.typeCondition.name.value,
      isExternal: false
    })),
    ...config2.externalFragments || []
  ];
  const visitor = new GenericSdkVisitor(schema, allFragments, config2);
  const visitorResult = (0, import_plugin_helpers.oldVisit)(allAst, { leave: visitor });
  return {
    content: [
      visitor.fragments,
      ...visitorResult.definitions.filter((t) => typeof t === "string"),
      visitor.sdkContent
    ].join("\n")
  };
};

// src/codegen/index.ts
var generateTypes = async (schema, queryPathGlob = process.cwd(), fragDocPath = process.cwd(), options = {
  noSDK: false,
  verbose: false
}) => {
  if (options.verbose)
    logger.info("Generating types...");
  let docs = [];
  let fragDocs = [];
  if (!options.noSDK) {
    docs = await loadGraphQLDocuments(queryPathGlob);
    fragDocs = await loadGraphQLDocuments(fragDocPath);
  }
  const res = await (0, import_core.codegen)({
    filename: process.cwd(),
    schema: (0, import_graphql7.parse)((0, import_graphql7.printSchema)(schema)),
    documents: [...docs, ...fragDocs],
    config: {},
    plugins: [
      { typescript: {} },
      { typescriptOperations: {} },
      {
        typescriptSdk: {}
      },
      { AddGeneratedClient: {} }
    ],
    pluginMap: {
      typescript: {
        plugin: import_typescript.plugin
      },
      typescriptOperations: {
        plugin: import_typescript_operations.plugin
      },
      typescriptSdk: {
        plugin
      },
      AddGeneratedClient
    }
  });
  return res;
};
var loadGraphQLDocuments = async (globPath) => {
  let result = [];
  try {
    result = await (0, import_load.loadDocuments)(globPath, {
      loaders: [new import_graphql_file_loader.GraphQLFileLoader()]
    });
  } catch (e) {
    if ((e.message || "").includes("Unable to find any GraphQL type definitions for the following pointers:")) {
    } else {
      throw e;
    }
  }
  return result;
};

// src/cmds/query-gen/genTypes.ts
var import_esbuild2 = __toModule(require("esbuild"));
var TINA_HOST = "content.tinajs.io";
var root = process.cwd();
var generatedPath = import_path5.default.join(root, ".tina", "__generated__");
async function genClient({
  tinaSchema,
  usingTs
}, options) {
  var _a, _b, _c, _d, _e;
  const branch = (_a = tinaSchema == null ? void 0 : tinaSchema.config) == null ? void 0 : _a.branch;
  const clientId = (_b = tinaSchema == null ? void 0 : tinaSchema.config) == null ? void 0 : _b.clientId;
  const token = (_c = tinaSchema.config) == null ? void 0 : _c.token;
  const baseUrl = ((_e = (_d = tinaSchema == null ? void 0 : tinaSchema.config) == null ? void 0 : _d.tinaioConfig) == null ? void 0 : _e.contentApiUrlOverride) || `https://${TINA_HOST}`;
  if ((!branch || !clientId || !token) && !(options == null ? void 0 : options.local)) {
    const missing = [];
    if (!branch)
      missing.push("branch");
    if (!clientId)
      missing.push("clientId");
    if (!token)
      missing.push("token");
    throw new Error(`Client not configured properly. Missing ${missing.join(", ")}. Please visit https://tina.io/docs/tina-cloud/connecting-site/ for more information`);
  }
  const apiURL = options.local ? `http://localhost:${options.port || 4001}/graphql` : `${baseUrl}/content/${clientId}/github/${branch}`;
  const clientPath = import_path5.default.join(generatedPath, `client.${usingTs ? "ts" : "js"}`);
  import_fs_extra3.default.writeFileSync(clientPath, `import { createClient } from "tinacms/dist/client";
import { queries } from "./types";
export const client = createClient({ url: '${apiURL}', token: '${token}', queries });
export default client;
  `);
  return apiURL;
}
async function genTypes({ schema, usingTs }, next, options) {
  const typesPath = process.cwd() + "/.tina/__generated__/types.ts";
  const typesJSPath = process.cwd() + "/.tina/__generated__/types.js";
  const typesDPath = process.cwd() + "/.tina/__generated__/types.d.ts";
  const fragPath = process.cwd() + "/.tina/__generated__/*.{graphql,gql}";
  const queryPathGlob = process.cwd() + "/.tina/queries/**/*.{graphql,gql}";
  const typescriptTypes = await generateTypes(schema, queryPathGlob, fragPath, options);
  const code = `//@ts-nocheck
  // DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
  export function gql(strings: TemplateStringsArray, ...args: string[]): string {
    let str = ''
    strings.forEach((string, i) => {
      str += string + (args[i] || '')
    })
    return str
  }
  ${typescriptTypes}
  `;
  if (usingTs) {
    await import_fs_extra3.default.outputFile(typesPath, code);
  } else {
    await import_fs_extra3.default.outputFile(typesDPath, code);
    const jsCode = await (0, import_esbuild2.transform)(code, { loader: "ts" });
    await import_fs_extra3.default.outputFile(typesJSPath, jsCode.code);
  }
  const schemaString = await (0, import_graphql8.printSchema)(schema);
  const schemaPath = process.cwd() + "/.tina/__generated__/schema.gql";
  await import_fs_extra3.default.outputFile(schemaPath, `# DO NOT MODIFY THIS FILE. This file is automatically generated by Tina
${schemaString}
schema {
  query: Query
  mutation: Mutation
}
  `);
  next();
}

// src/buildTina/git.ts
var import_fs_extra4 = __toModule(require("fs-extra"));
var import_ini = __toModule(require("ini"));
var import_os = __toModule(require("os"));
var import_path6 = __toModule(require("path"));
var resolveGitRoot = async () => {
  const pathParts = process.cwd().split(import_path6.default.sep);
  while (true) {
    const pathToGit = pathParts.join(import_path6.default.sep);
    if (await import_fs_extra4.default.pathExists(import_path6.default.join(pathToGit, ".git"))) {
      return pathToGit;
    }
    if (!pathParts.length) {
      throw new Error("Unable to locate your .git folder (required for isomorphicGitBridge)");
    }
    pathParts.pop();
  }
};
async function makeIsomorphicOptions(fsBridge) {
  var _a, _b, _c, _d;
  const gitRoot = await resolveGitRoot();
  const options = {
    gitRoot,
    author: {
      name: "",
      email: ""
    },
    onPut: async (filepath, data) => {
      await fsBridge.put(filepath, data);
    },
    onDelete: async (filepath) => {
      await fsBridge.delete(filepath);
    }
  };
  const userGitConfig = `${import_os.default.homedir()}${import_path6.default.sep}.gitconfig`;
  if (await import_fs_extra4.default.pathExists(userGitConfig)) {
    const config2 = import_ini.default.parse(await import_fs_extra4.default.readFile(userGitConfig, "utf-8"));
    if ((_a = config2["user"]) == null ? void 0 : _a["name"]) {
      options.author.name = config2["user"]["name"];
    }
    if ((_b = config2["user"]) == null ? void 0 : _b["email"]) {
      options.author.email = config2["user"]["email"];
    }
  }
  let repoGitConfig = void 0;
  if (!options.author.name) {
    repoGitConfig = import_ini.default.parse(await import_fs_extra4.default.readFile(`${gitRoot}/.git/config`, "utf-8"));
    if ((_c = repoGitConfig["user"]) == null ? void 0 : _c["name"]) {
      options.author.name = repoGitConfig["user"]["name"];
    }
    if (!options.author.name) {
      throw new Error('Unable to determine user.name from git config. Hint: `git config --global user.name "John Doe"`');
    }
  }
  if (!options.author.email) {
    repoGitConfig = repoGitConfig || import_ini.default.parse(await import_fs_extra4.default.readFile(`${gitRoot}/.git/config`, "utf-8"));
    if ((_d = repoGitConfig["user"]) == null ? void 0 : _d["email"]) {
      options.author.email = repoGitConfig["user"]["email"];
    }
    if (!options.author.email) {
      throw new Error("Unable to determine user.email from git config. Hint: `git config --global user.email johndoe@example.com`");
    }
  }
  return options;
}

// src/buildTina/index.ts
var import_app = __toModule(require("@tinacms/app"));

// src/utils/spinner.ts
var import_cli_spinner = __toModule(require("cli-spinner"));
async function spin({
  waitFor,
  text
}) {
  const spinner = new import_cli_spinner.Spinner({
    text: `${text} %s`,
    stream: process.stderr,
    onTick: function(msg) {
      this.clearLine(this.stream);
      this.stream.write(msg);
    }
  });
  spinner.setSpinnerString("\u280B\u2819\u2839\u2838\u283C\u2834\u2826\u2827\u2807\u280F");
  spinner.start();
  const res = await waitFor();
  spinner.stop();
  console.log("");
  return res;
}

// src/buildTina/attachPath.ts
var import_fs_extra5 = __toModule(require("fs-extra"));
var import_path7 = __toModule(require("path"));
var attachPath = async (ctx, next, _options) => {
  ctx.rootPath = process.cwd();
  ctx.usingTs = await isProjectTs(ctx.rootPath);
  next();
};
var isProjectTs = async (rootPath2) => {
  const tinaPath = import_path7.default.join(rootPath2, ".tina");
  return await (0, import_fs_extra5.pathExists)(import_path7.default.join(tinaPath, "schema.ts")) || await (0, import_fs_extra5.pathExists)(import_path7.default.join(tinaPath, "schema.tsx")) || await (0, import_fs_extra5.pathExists)(import_path7.default.join(tinaPath, "config.ts")) || await (0, import_fs_extra5.pathExists)(import_path7.default.join(tinaPath, "config.tsx"));
};

// src/buildTina/index.ts
var buildSetupCmdBuild = async (ctx, next, opts) => {
  const rootPath2 = ctx.rootPath;
  const { bridge, database } = await buildSetup(__spreadProps(__spreadValues({}, opts), {
    rootPath: rootPath2,
    useMemoryStore: true
  }));
  ctx.bridge = bridge;
  ctx.database = database;
  ctx.builder = new ConfigBuilder(database);
  next();
};
var buildSetupCmdServerStart = async (ctx, next, opts) => {
  const rootPath2 = ctx.rootPath;
  const { bridge, database } = await buildSetup(__spreadProps(__spreadValues({}, opts), {
    rootPath: rootPath2,
    useMemoryStore: false
  }));
  ctx.bridge = bridge;
  ctx.database = database;
  ctx.builder = new ConfigBuilder(database);
  next();
};
var buildSetupCmdAudit = async (ctx, next, options) => {
  const rootPath2 = ctx.rootPath;
  const bridge = options.clean ? new import_datalayer.FilesystemBridge(rootPath2) : new import_datalayer.AuditFileSystemBridge(rootPath2);
  await import_fs_extra6.default.ensureDirSync(import_path8.default.join(rootPath2, ".tina", "__generated__"));
  const store = new import_datalayer.LevelStore(rootPath2, false);
  const database = await (0, import_graphql9.createDatabase)({ store, bridge });
  ctx.bridge = bridge;
  ctx.database = database;
  ctx.builder = new ConfigBuilder(database);
  next();
};
var buildSetup = async ({
  isomorphicGitBridge: isomorphicGitBridge2,
  rootPath: rootPath2,
  useMemoryStore
}) => {
  const fsBridge = new import_datalayer.FilesystemBridge(rootPath2);
  const isomorphicOptions = isomorphicGitBridge2 && await makeIsomorphicOptions(fsBridge);
  const bridge = isomorphicGitBridge2 ? new import_datalayer.IsomorphicBridge(rootPath2, isomorphicOptions) : fsBridge;
  await import_fs_extra6.default.ensureDirSync(import_path8.default.join(rootPath2, ".tina", "__generated__"));
  const store = new import_datalayer.LevelStore(rootPath2, useMemoryStore);
  const database = await (0, import_graphql9.createDatabase)({ store, bridge });
  return { database, bridge, store };
};
var buildCmdBuild = async (ctx, next, options) => {
  const { schema } = await ctx.builder.build(__spreadValues({
    rootPath: ctx.rootPath
  }, options));
  ctx.schema = schema;
  const apiUrl = await ctx.builder.genTypedClient({
    compiledSchema: schema,
    local: options.local,
    noSDK: options.noSDK,
    verbose: options.verbose,
    usingTs: ctx.usingTs,
    port: options.port
  });
  ctx.apiUrl = apiUrl;
  await buildAdmin({
    local: options.local,
    rootPath: ctx.rootPath,
    schema,
    apiUrl
  });
  next();
};
var auditCmdBuild = async (ctx, next, options) => {
  const { graphQLSchema, tinaSchema } = await ctx.builder.build(__spreadProps(__spreadValues({
    rootPath: ctx.rootPath
  }, options), {
    verbose: true
  }));
  await spin({
    waitFor: async () => {
      await ctx.database.indexContent({ graphQLSchema, tinaSchema });
    },
    text: "Indexing local files"
  });
  next();
};
var ConfigBuilder = class {
  constructor(database) {
    this.database = database;
  }
  async build({ dev, verbose, rootPath: rootPath2, local }) {
    const usingTs = await isProjectTs(rootPath2);
    if (!rootPath2) {
      throw new Error("Root path has not been attached");
    }
    const tinaGeneratedPath = import_path8.default.join(rootPath2, ".tina", "__generated__");
    this.database.clearCache();
    await import_fs_extra6.default.mkdirp(tinaGeneratedPath);
    await this.database.store.close();
    await resetGeneratedFolder({
      tinaGeneratedPath,
      usingTs,
      isBuild: !local
    });
    await this.database.store.open();
    const compiledSchema = await compileSchema({
      verbose,
      dev,
      rootPath: rootPath2
    });
    const { graphQLSchema, tinaSchema } = await (0, import_graphql9.buildSchema)(rootPath2, this.database, ["experimentalData", "isomorphicGitBridge"]);
    return { schema: compiledSchema, graphQLSchema, tinaSchema };
  }
  async genTypedClient({
    usingTs,
    compiledSchema,
    noSDK,
    verbose,
    local,
    port
  }) {
    const astSchema = await (0, import_graphql9.getASTSchema)(this.database);
    await genTypes({ schema: astSchema, usingTs }, () => {
    }, {
      noSDK,
      verbose
    });
    return genClient({ tinaSchema: compiledSchema, usingTs }, {
      local,
      port
    });
  }
};
var buildAdmin = async ({
  schema,
  local,
  rootPath: rootPath2,
  apiUrl
}) => {
  var _a;
  if ((_a = schema == null ? void 0 : schema.config) == null ? void 0 : _a.build) {
    const buildVite = async () => {
      var _a2, _b, _c, _d, _e, _f, _g;
      await (0, import_app.viteBuild)({
        local,
        rootPath: rootPath2,
        outputFolder: (_b = (_a2 = schema == null ? void 0 : schema.config) == null ? void 0 : _a2.build) == null ? void 0 : _b.outputFolder,
        publicFolder: (_d = (_c = schema == null ? void 0 : schema.config) == null ? void 0 : _c.build) == null ? void 0 : _d.publicFolder,
        apiUrl,
        host: (_g = (_f = (_e = schema == null ? void 0 : schema.config) == null ? void 0 : _e.build) == null ? void 0 : _f.host) != null ? _g : false
      });
    };
    if (local) {
      logger.info(logText("Starting Tina asset server"));
      await buildVite();
    } else {
      await spin({
        text: logText("Building static site"),
        waitFor: buildVite
      });
      logger.info(logText("\nDone building static site"));
    }
  }
};

// src/cmds/start-server/index.ts
var buildLock = new AsyncLock();
var reBuildLock = new AsyncLock();
var gqlPackageFile = require.resolve("@tinacms/graphql");
async function startServer(ctx, next, {
  port = 4001,
  noWatch,
  noSDK,
  noTelemetry,
  watchFolders,
  verbose,
  dev
}) {
  buildLock.disable();
  reBuildLock.disable();
  const rootPath2 = ctx.rootPath;
  const t = new import_metrics2.Telemetry({ disabled: Boolean(noTelemetry) });
  t.submitRecord({
    event: {
      name: "tinacms:cli:server:start:invoke"
    }
  });
  const bridge = ctx.bridge;
  const database = ctx.database;
  const shouldBuild = bridge.supportsBuilding();
  let ready = false;
  const state = {
    server: null,
    sockets: []
  };
  let isReady = false;
  const beforeBuild = async () => {
    await buildLock.promise;
    buildLock.enable();
  };
  const afterBuild = async () => {
    buildLock.disable();
  };
  const start = async () => {
    await buildLock.promise;
    buildLock.enable();
    try {
      const s = (init_server3(), server_exports);
      state.server = await s.default(database);
      await new Promise((resolve2, reject) => {
        state.server.listen(port, () => {
          var _a, _b;
          const altairUrl = `http://localhost:${port}/altair/`;
          const cmsUrl = ((_b = (_a = ctx.schema) == null ? void 0 : _a.config) == null ? void 0 : _b.build) ? `[your-development-url]/${ctx.schema.config.build.outputFolder}/index.html` : `[your-development-url]/admin`;
          if (verbose)
            logger.info(`Started Filesystem GraphQL server on port: ${port}`);
          console.log("");
          logger.info(indentedCmd(`GraphQL playground: ${linkText(altairUrl)}`));
          logger.info(indentedCmd(`CMS: ${linkText(cmsUrl)} 
`));
          resolve2();
        });
        state.server.on("error", function(e) {
          if (e.code === "EADDRINUSE") {
            logger.error(dangerText(`Port ${port} already in use`));
          }
          reject(e);
        });
        state.server.on("connection", (socket) => {
          state.sockets.push(socket);
        });
      });
    } catch (error) {
      throw error;
    } finally {
      buildLock.disable();
    }
  };
  const restart = async () => {
    return new Promise((resolve2, reject) => {
      logger.info("restarting local server...");
      delete require.cache[gqlPackageFile];
      state.sockets.forEach((socket) => {
        if (socket.destroyed === false) {
          socket.destroy();
        }
      });
      state.sockets = [];
      state.server.close(async () => {
        logger.info("Server closed");
        start().then((x) => resolve2(x)).catch((err) => reject(err));
      });
    });
  };
  const build2 = async () => {
    var _a, _b;
    logger.info(titleText(" TinaCMS ") + focusText(" - Build Started\n"));
    try {
      await beforeBuild();
      const { schema, graphQLSchema, tinaSchema } = await ctx.builder.build({
        rootPath: ctx.rootPath,
        verbose,
        local: true
      });
      ctx.schema = schema;
      const missingFormat = (_b = (_a = tinaSchema == null ? void 0 : tinaSchema.schema) == null ? void 0 : _a.collections) == null ? void 0 : _b.filter((x) => !x.format).map((x) => x.name).join(", ");
      if (missingFormat) {
        logger.warn(warnText(`No format provided for collection(s) "${missingFormat}", defaulting to .md`));
      }
      const apiUrl = await ctx.builder.genTypedClient({
        compiledSchema: schema,
        local: true,
        noSDK,
        verbose,
        usingTs: ctx.usingTs,
        port
      });
      await spin({
        waitFor: async () => {
          await ctx.database.indexContent({ graphQLSchema, tinaSchema });
        },
        text: logText("Indexing local files")
      });
      await buildAdmin({
        local: true,
        rootPath: ctx.rootPath,
        schema,
        apiUrl
      });
    } catch (error) {
      throw error;
    } finally {
      await afterBuild();
    }
  };
  const foldersToWatch = (watchFolders || []).map((x) => import_path11.default.join(rootPath2, x));
  if (!noWatch && !process.env.CI) {
    import_chokidar.default.watch([
      ...foldersToWatch,
      `${rootPath2}/.tina/**/*.{ts,gql,graphql,js,tsx,jsx}`,
      gqlPackageFile
    ], {
      ignored: [
        "**/node_modules/**/*",
        "**/.next/**/*",
        `${import_path11.default.resolve(rootPath2)}/.tina/__generated__/**/*`
      ]
    }).on("ready", async () => {
      if (verbose)
        console.log("Generating Tina config");
      try {
        if (shouldBuild) {
          await build2();
        }
        ready = true;
        isReady = true;
        await start();
        next();
      } catch (e) {
        handleServerErrors(e);
        throw e;
      }
    }).on("all", async () => {
      if (ready) {
        await reBuildLock.promise;
        reBuildLock.enable();
        logger.info("Tina change detected, regenerating config");
        try {
          if (shouldBuild) {
            await build2();
          }
          if (isReady) {
            await restart();
          }
        } catch (e) {
          handleServerErrors(e);
          t.submitRecord({
            event: {
              name: "tinacms:cli:server:error",
              errorMessage: e.message
            }
          });
        } finally {
          reBuildLock.disable();
        }
      }
    });
  } else {
    if (process.env.CI) {
      logger.info("Detected CI environment, omitting watch commands...");
    }
    if (shouldBuild) {
      await build2();
    }
    await start();
    next();
  }
}

// src/cmds/statusChecks/waitForIndexing.ts
var import_progress = __toModule(require("progress"));
var import_url_pattern = __toModule(require("url-pattern"));
var POLLING_INTERVAL = 5e3;
var STATUS_INPROGRESS = "inprogress";
var STATUS_COMPLETE = "complete";
var STATUS_FAILED = "failed";
var IndexFailedError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "IndexFailedError";
  }
};
var waitForDB = async (ctx, next, options) => {
  const token = ctx.schema.config.token;
  const { clientId, branch, isLocalClient, host } = parseURL(ctx.apiUrl);
  if (isLocalClient) {
    return next();
  }
  const bar = new import_progress.default("Checking indexing process in Tina Cloud... :prog", 1);
  const pollForStatus = async () => {
    try {
      if (options.verbose) {
        logger.info(logText("Polling for status..."));
      }
      const headers = new Headers();
      headers.append("Content-Type", "application/json");
      if (token) {
        headers.append("X-API-KEY", token);
      }
      const response = await fetch(`https://${host}/db/${clientId}/status/${branch}`, {
        method: "GET",
        headers
      });
      const { status, error } = await response.json();
      const statusMessage = `Indexing status: '${status}'`;
      if (status === STATUS_COMPLETE) {
        bar.tick({
          prog: "\u2705"
        });
        return next();
      } else if (status === STATUS_INPROGRESS) {
        if (options.verbose) {
          logger.info(logText(`${statusMessage}, trying again in 5 seconds`));
        }
        setTimeout(pollForStatus, POLLING_INTERVAL);
      } else if (status === STATUS_FAILED) {
        throw new IndexFailedError(`Attempting to index but responded with status 'failed', To retry the indexing process, click \u201CReset Repository Cache\u201D in tina cloud advance settings.  ${error}`);
      } else {
        throw new IndexFailedError(`Attempting to index but responded with status 'unknown', To retry the indexing process, click \u201CReset Repository Cache\u201D in tina cloud advance settings.  ${error}`);
      }
    } catch (e) {
      if (e instanceof IndexFailedError) {
        bar.tick({
          prog: "\u274C"
        });
        throw e;
      } else {
        throw new Error(`Unable to query DB for indexing status, encountered error: ${e.message}`);
      }
    }
  };
  spin({
    text: "Checking indexing process in Tina Cloud...",
    waitFor: pollForStatus
  });
};
var parseURL = (url) => {
  if (url.includes("localhost")) {
    return {
      host: "localhost",
      branch: null,
      isLocalClient: true,
      clientId: null
    };
  }
  const params = new URL(url);
  const pattern = new import_url_pattern.default("/content/:clientId/github/*", {
    escapeChar: " "
  });
  const result = pattern.match(params.pathname);
  const branch = result == null ? void 0 : result._;
  const clientId = result == null ? void 0 : result.clientId;
  if (!branch || !clientId) {
    throw new Error(`Invalid URL format provided. Expected: https://content.tinajs.io/content/<ClientID>/github/<Branch> but but received ${url}`);
  }
  return {
    host: params.host,
    clientId,
    branch,
    isLocalClient: false
  };
};

// src/cmds/startSubprocess/index.ts
var import_child_process = __toModule(require("child_process"));
var startSubprocess = async (_ctx, next, { command }) => {
  if (typeof command === "string") {
    const commands = command.split(" ");
    const firstCommand = commands[0];
    const args = commands.slice(1) || [];
    const ps = import_child_process.default.spawn(firstCommand, args, {
      stdio: "inherit",
      shell: true
    });
    ps.on("error", (code) => {
      logger.error(dangerText(`An error has occurred in the Next.js child process. Error message below`));
      logger.error(`name: ${code.name}
message: ${code.message}

stack: ${code.stack || "No stack was provided"}`);
    });
    ps.on("close", (code) => {
      logger.info(`child process exited with code ${code}`);
      process.exit(code);
    });
  }
};

// src/cmds/init/index.ts
var import_path13 = __toModule(require("path"));
var import_prettier = __toModule(require("prettier"));
var import_fs_extra10 = __toModule(require("fs-extra"));
var import_prompts2 = __toModule(require("prompts"));
var import_metrics3 = __toModule(require("@tinacms/metrics"));

// src/cmds/init/setup-files/index.ts
var nextPostPage = ({
  usingSrc
}) => `// THIS FILE HAS BEEN GENERATED WITH THE TINA CLI.
  // This is a demo file once you have tina setup feel free to delete this file
  
  import Head from 'next/head'
  import { useTina } from 'tinacms/dist/react'
  import { TinaMarkdown } from 'tinacms/dist/rich-text'
  import client from '${usingSrc ? "../" : ""}../../../.tina/__generated__/client'
  
  const BlogPage = (props) => {
    const { data } = useTina({
      query: props.query,
      variables: props.variables,
      data: props.data,
    })
  
    return (
      <>
        <Head>
          {/* Tailwind CDN */}
          <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.7/tailwind.min.css"
            integrity="sha512-y6ZMKFUQrn+UUEVoqYe8ApScqbjuhjqzTuwUMEGMDuhS2niI8KA3vhH2LenreqJXQS+iIXVTRL2iaNfJbDNA1Q=="
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
          />
        </Head>
        <div>
          <div
            style={{
              textAlign: 'center',
            }}
          >
            <h1 className="text-3xl m-8 text-center leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              {data.post.title}
            </h1>
            <ContentSection content={data.post.body}></ContentSection>
          </div>
          <div className="bg-green-100 text-center">
            Lost and looking for a place to start?
            <a
              href="https://tina.io/guides/tina-cloud/getting-started/overview/"
              className="text-blue-500 underline"
            >
              {' '}
              Check out this guide
            </a>{' '}
            to see how add TinaCMS to an existing Next.js site.
          </div>
        </div>
      </>
    )
  }
  
  export const getStaticProps = async ({ params }) => {
    let data = {}
    let query = {}
    let variables = { relativePath: \`\${params.filename}.md\` }
    try {
      const res = await client.queries.post(variables)
      query = res.query
      data = res.data
      variables = res.variables
    } catch {
      // swallow errors related to document creation
    }
  
    return {
      props: {
        variables: variables,
        data: data,
        query: query,
        //myOtherProp: 'some-other-data',
      },
    }
  }
  
  export const getStaticPaths = async () => {
    const postsListData = await client.queries.postConnection()
  
    return {
      paths: postsListData.data.postConnection.edges.map((post) => ({
        params: { filename: post.node._sys.filename },
      })),
      fallback: false,
    }
  }
  
  export default BlogPage
  
  const PageSection = (props) => {
    return (
      <>
        <h2>{props.heading}</h2>
        <p>{props.content}</p>
      </>
    )
  }
  
  const components = {
    PageSection: PageSection,
  }
  
  const ContentSection = ({ content }) => {
    return (
      <div className="relative py-16 bg-white overflow-hidden">
        <div className="hidden lg:block lg:absolute lg:inset-y-0 lg:h-full lg:w-full">
          <div
            className="relative h-full text-lg max-w-prose mx-auto"
            aria-hidden="true"
          >
            <svg
              className="absolute top-12 left-full transform translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="74b3fd99-0a6f-4271-bef2-e80eeafdf357"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#74b3fd99-0a6f-4271-bef2-e80eeafdf357)"
              />
            </svg>
            <svg
              className="absolute top-1/2 right-full transform -translate-y-1/2 -translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="f210dbf6-a58d-4871-961e-36d5016a0f49"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#f210dbf6-a58d-4871-961e-36d5016a0f49)"
              />
            </svg>
            <svg
              className="absolute bottom-12 left-full transform translate-x-32"
              width={404}
              height={384}
              fill="none"
              viewBox="0 0 404 384"
            >
              <defs>
                <pattern
                  id="d3eb07ae-5182-43e6-857d-35c643af9034"
                  x={0}
                  y={0}
                  width={20}
                  height={20}
                  patternUnits="userSpaceOnUse"
                >
                  <rect
                    x={0}
                    y={0}
                    width={4}
                    height={4}
                    className="text-gray-200"
                    fill="currentColor"
                  />
                </pattern>
              </defs>
              <rect
                width={404}
                height={384}
                fill="url(#d3eb07ae-5182-43e6-857d-35c643af9034)"
              />
            </svg>
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:px-8">
          <div className="text-lg max-w-prose mx-auto">
            <TinaMarkdown components={components} content={content} />
          </div>
        </div>
      </div>
    )
  }`;

// src/utils/script-helpers.ts
function generateGqlScript(scriptValue) {
  return `tinacms dev -c "${scriptValue}"`;
}
function extendNextScripts(scripts) {
  return __spreadProps(__spreadValues({}, scripts), {
    dev: generateGqlScript((scripts == null ? void 0 : scripts.dev) || "next dev"),
    build: `tinacms build && ${(scripts == null ? void 0 : scripts.build) || "next build"}`,
    start: `tinacms build && ${(scripts == null ? void 0 : scripts.start) || "next start"}`
  });
}

// src/cmds/init/setup-files/config.ts
var other = (args) => {
  return `
import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || "main";

export default defineConfig({
  branch,
  clientId: ${args.clientId ? `'${args.clientId}'` : "null"}, // Get this from tina.io
  token:  ${args.token ? `'${args.token}'` : "null"}, // Get this from tina.io
  build: {
    outputFolder: "admin",
    publicFolder: "${args.publicFolder}",
  },
  media: {
    tina: {
      mediaRoot: "",
      publicFolder: "${args.publicFolder}",
    },
  },
  schema: {
    collections: ${args.collections || `[
      {
        name: "post",
        label: "Posts",
        path: "content/posts",
        fields: [
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ]`},
  },
});
`;
};
var configExamples = {
  next: (args) => `import { defineConfig } from 'tinacms'

  // Your hosting provider likely exposes this as an environment variable
  const branch = process.env.HEAD || process.env.VERCEL_GIT_COMMIT_REF || 'main'
  
  export default defineConfig({
    branch,
    clientId: ${args.clientId ? `'${args.clientId}'` : "null"}, // Get this from tina.io
    token:  ${args.token ? `'${args.token}'` : "null"}, // Get this from tina.io
    build: {
      outputFolder: "admin",
      publicFolder: "${args.publicFolder}",
    },
    media: {
      tina: {
        mediaRoot: "",
        publicFolder: "${args.publicFolder}",
      },
    },
    schema: {
      collections:${args.collections || `[
        {
          name: 'post',
          label: 'Posts',
          path: 'content/posts',
          fields: [
            {
              type: 'string',
              name: 'title',
              label: 'Title',
              isTitle: true,
              required: true,
            },
            {
              type: 'rich-text',
              name: 'body',
              label: 'Body',
              isBody: true,
            },
          ],
          ui: {
            // This is an DEMO router. You can remove this to fit your site
            router: ({ document }) => \`/demo/blog/\${document._sys.filename}\`,
          },
        },
      ]`},
    },
  })
  `,
  other,
  hugo: other,
  jekyll: other
};

// src/cmds/forestry-migrate/util/index.ts
var import_fs_extra8 = __toModule(require("fs-extra"));
var import_path12 = __toModule(require("path"));
var import_js_yaml = __toModule(require("js-yaml"));
var import_zod = __toModule(require("zod"));
var forestryConfigSchema = import_zod.default.object({
  sections: import_zod.default.array(import_zod.default.object({
    type: import_zod.default.union([
      import_zod.default.literal("directory"),
      import_zod.default.literal("document"),
      import_zod.default.literal("heading"),
      import_zod.default.literal("jekyll-pages"),
      import_zod.default.literal("jekyll-posts")
    ]),
    label: import_zod.default.string(),
    path: import_zod.default.string().optional(),
    match: import_zod.default.string().optional(),
    exclude: import_zod.default.string().optional(),
    create: import_zod.default.union([import_zod.default.literal("all"), import_zod.default.literal("documents"), import_zod.default.literal("none")]).optional(),
    templates: import_zod.default.array(import_zod.default.string()).optional(),
    new_doc_ext: import_zod.default.string().optional(),
    read_only: import_zod.default.boolean().optional()
  }))
});
var forestryFieldWithoutField = import_zod.default.object({
  type: import_zod.default.union([
    import_zod.default.literal("text"),
    import_zod.default.literal("datetime"),
    import_zod.default.literal("list"),
    import_zod.default.literal("file"),
    import_zod.default.literal("image_gallery"),
    import_zod.default.literal("textarea"),
    import_zod.default.literal("tag_list"),
    import_zod.default.literal("number"),
    import_zod.default.literal("boolean"),
    import_zod.default.literal("field_group"),
    import_zod.default.literal("field_group_list"),
    import_zod.default.literal("select"),
    import_zod.default.literal("include"),
    import_zod.default.literal("blocks"),
    import_zod.default.literal("color")
  ]),
  name: import_zod.default.string(),
  label: import_zod.default.string(),
  default: import_zod.default.any().optional(),
  config: import_zod.default.object({
    required: import_zod.default.boolean().optional(),
    use_select: import_zod.default.boolean().optional(),
    date_format: import_zod.default.string().optional(),
    time_format: import_zod.default.string().optional(),
    options: import_zod.default.array(import_zod.default.string()).optional(),
    source: import_zod.default.object({
      type: import_zod.default.union([
        import_zod.default.literal("custom"),
        import_zod.default.literal("pages"),
        import_zod.default.literal("documents"),
        import_zod.default.literal("simple"),
        import_zod.default.string()
      ]).optional(),
      section: import_zod.default.string().optional()
    }).optional()
  }).optional()
});
var forestryField = import_zod.default.lazy(() => forestryFieldWithoutField.extend({
  fields: import_zod.default.array(forestryField).optional()
}));
var FrontmatterTemplateSchema = import_zod.default.object({
  label: import_zod.default.string(),
  hide_body: import_zod.default.boolean().optional(),
  fields: import_zod.default.array(forestryField).optional()
});
var transformForestryFieldsToTinaFields = ({
  fields,
  collection
}) => {
  const tinaFields = [];
  fields == null ? void 0 : fields.forEach((forestryField2) => {
    var _a, _b, _c, _d;
    let field;
    switch (forestryField2.type) {
      case "text":
        field = {
          type: "string",
          name: forestryField2.name,
          label: forestryField2.label
        };
        break;
      case "textarea":
        field = {
          type: "string",
          name: forestryField2.name,
          label: forestryField2.label,
          ui: {
            component: "textarea"
          }
        };
        break;
      case "datetime":
        field = {
          type: forestryField2.type,
          name: forestryField2.name,
          label: forestryField2.label
        };
        break;
      case "number":
        field = {
          type: "number",
          name: forestryField2.name,
          label: forestryField2.label
        };
        break;
      case "boolean":
        field = {
          type: "boolean",
          name: forestryField2.name,
          label: forestryField2.label
        };
        break;
      case "color":
        field = {
          type: "string",
          name: forestryField2.name,
          label: forestryField2.label,
          ui: {
            component: "color"
          }
        };
        break;
      case "file":
        field = {
          type: "image",
          name: forestryField2.name || "image",
          label: forestryField2.label
        };
        break;
      case "select":
        if ((_a = forestryField2.config) == null ? void 0 : _a.options) {
          field = {
            type: "string",
            name: forestryField2.name,
            label: forestryField2.label,
            options: ((_b = forestryField2.config) == null ? void 0 : _b.options) || []
          };
        } else {
          logger.info(`Warning in collection ${collection}. "select" field migration has only been implemented for simple select. Other versions of select have not been implemented yet. To make your \`${forestryField2.name}\` field work, you will need to manually add it to your schema.`);
        }
        break;
      case "list":
        field = {
          type: "string",
          name: forestryField2.name,
          label: forestryField2.label,
          list: true
        };
        if ((_c = forestryField2.config) == null ? void 0 : _c.options) {
          field.options = forestryField2.config.options;
        }
        break;
      case "tag_list":
        field = {
          type: "string",
          name: forestryField2.name,
          label: forestryField2.label,
          list: true,
          ui: {
            component: "tags"
          }
        };
        break;
      case "field_group":
        field = {
          type: "object",
          name: forestryField2.name,
          label: forestryField2.label,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField2.fields,
            collection
          })
        };
        break;
      case "field_group_list":
        field = {
          type: "object",
          name: forestryField2.name,
          label: forestryField2.label,
          list: true,
          fields: transformForestryFieldsToTinaFields({
            fields: forestryField2.fields,
            collection
          })
        };
        break;
      case "image_gallery":
      case "include":
        console.log(`Unsupported field type: ${forestryField2.type}, in collection ${collection}. This will not be added to the schema.`);
        break;
      default:
        logger.info(`Warning in collection ${collection}. "${forestryField2.type}" migration has not been implemented yet. To make your \`${forestryField2.name}\` field work, you will need to manually add it to your schema.`);
    }
    if (field) {
      if ((_d = forestryField2.config) == null ? void 0 : _d.required) {
        field = __spreadProps(__spreadValues({}, field), { required: true });
      }
      tinaFields.push(field);
    }
  });
  return tinaFields;
};
var getFieldsFromTemplates = ({
  tem,
  rootPath: rootPath2,
  collection
}) => {
  const templatePath = import_path12.default.join(rootPath2, ".forestry", "front_matter", "templates", `${tem}.yml`);
  let templateString = "";
  try {
    templateString = import_fs_extra8.default.readFileSync(templatePath).toString();
  } catch {
    throw new Error(`Could not find template ${tem} at ${templatePath}

 This will require manual migration.`);
  }
  const templateObj = import_js_yaml.default.load(templateString);
  const template = parseTemplates({ val: templateObj });
  const fields = transformForestryFieldsToTinaFields({
    fields: template.fields,
    collection
  });
  return fields;
};
var parseTemplates = ({ val }) => {
  const template = FrontmatterTemplateSchema.parse(val);
  return template;
};
var hasForestryConfig = async ({ rootPath: rootPath2 }) => {
  const forestryPath = import_path12.default.join(rootPath2, ".forestry", "settings.yml");
  const exists = await import_fs_extra8.default.pathExists(forestryPath);
  return {
    path: forestryPath,
    exists
  };
};
var parseSections = ({ val }) => {
  const schema = forestryConfigSchema.parse(val);
  return schema;
};

// src/cmds/forestry-migrate/index.ts
var import_fs_extra9 = __toModule(require("fs-extra"));
var import_js_yaml2 = __toModule(require("js-yaml"));
var stringifyLabel = (label) => {
  return label.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
};
var generateCollections = async ({
  forestryPath,
  rootPath: rootPath2
}) => {
  var _a;
  const forestryConfig = await import_fs_extra9.default.readFile(forestryPath);
  const forestryYaml = import_js_yaml2.default.load(forestryConfig.toString());
  const forestrySchema = parseSections({ val: forestryYaml });
  const collections = [];
  (_a = forestrySchema.sections) == null ? void 0 : _a.forEach((section) => {
    var _a2, _b;
    if (section.read_only)
      return;
    switch (section.type) {
      case "directory":
        const fields = [
          {
            type: "rich-text",
            name: "body",
            label: "Body of Document",
            description: "This is the markdown body",
            isBody: true
          }
        ];
        if ((((_a2 = section.templates) == null ? void 0 : _a2.length) || 0) > 1) {
          const templates = [];
          section.templates.forEach((tem) => {
            try {
              const fields2 = getFieldsFromTemplates({
                tem,
                collection: stringifyLabel(section.label),
                rootPath: rootPath2
              });
              templates.push({ fields: fields2, label: tem, name: stringifyLabel(tem) });
            } catch (e) {
              console.log("Error parsing template ", tem);
              console.error(e);
            }
          });
          const c = {
            label: section.label,
            name: stringifyLabel(section.label),
            path: section.path,
            templates
          };
          if ((section == null ? void 0 : section.create) === "none") {
            c.ui = __spreadProps(__spreadValues({}, c.ui), {
              allowedActions: {
                create: false
              }
            });
          }
          collections.push(c);
        } else {
          (_b = section.templates) == null ? void 0 : _b.forEach((tem) => {
            try {
              const additionalFields = getFieldsFromTemplates({
                tem,
                rootPath: rootPath2,
                collection: stringifyLabel(section.label)
              });
              fields.push(...additionalFields);
            } catch (e) {
              console.log("Error parsing template ", tem);
              console.error(e);
            }
          });
          const c = {
            label: section.label,
            name: stringifyLabel(section.label),
            path: section.path,
            fields
          };
          if ((section == null ? void 0 : section.create) === "none") {
            c.ui = __spreadProps(__spreadValues({}, c.ui), {
              allowedActions: {
                create: false
              }
            });
          }
          collections.push(c);
        }
        break;
    }
  });
  return collections;
};

// src/cmds/init/index.ts
async function initStaticTina(ctx, next, options) {
  const baseDir = ctx.rootPath;
  logger.level = "info";
  const clientId = await chooseClientId();
  let token = null;
  if (clientId) {
    token = await chooseToken({ clientId });
  }
  const packageManager = await choosePackageManager();
  const framework = await chooseFramework();
  const usingTypescript = await chooseTypescript();
  const publicFolder = await choosePublicFolder({ framework });
  const forestryPath = await hasForestryConfig({ rootPath: ctx.rootPath });
  let collections;
  if (forestryPath.exists) {
    collections = await forestryMigrate({
      forestryPath: forestryPath.path,
      rootPath: ctx.rootPath
    });
  }
  await reportTelemetry({
    usingTypescript,
    hasForestryConfig: forestryPath.exists,
    noTelemetry: options.noTelemetry
  });
  const hasPackageJSON = await import_fs_extra10.default.pathExistsSync("package.json");
  if (!hasPackageJSON) {
    await createPackageJSON();
  }
  const hasGitignore = await import_fs_extra10.default.pathExistsSync(".gitignore");
  if (!hasGitignore) {
    await createGitignore({ baseDir });
  } else {
    const hasNodeModulesIgnored = await checkGitignoreForNodeModules({
      baseDir
    });
    if (!hasNodeModulesIgnored) {
      await addNodeModulesToGitignore({ baseDir });
    }
  }
  await addDependencies(packageManager);
  await addConfigFile({
    publicFolder,
    baseDir,
    usingTypescript,
    framework,
    collections,
    token,
    clientId
  });
  if (!forestryPath.exists) {
    await addContentFile({ baseDir });
  }
  if (framework.reactive) {
    await addReactiveFile[framework.name]({
      baseDir,
      framework,
      usingTypescript
    });
  }
  logNextSteps({ packageManager, framework });
}
var chooseClientId = async () => {
  const option = await (0, import_prompts2.default)({
    name: "clientId",
    type: "text",
    message: `What is your Tina Cloud Client ID? (Hit enter to skip and set up yourself later)
${logText("Don't have a Client ID? Create one here: ")}${linkText("https://app.tina.io/projects/new")}`
  });
  return option["clientId"];
};
var chooseToken = async ({ clientId }) => {
  const option = await (0, import_prompts2.default)({
    name: "token",
    type: "text",
    message: `What is your Tina Cloud Read Only Token?
${logText("Don't have a Read Only Token? Create one here: ")}${linkText(`https://app.tina.io/projects/${clientId}/tokens`)}`
  });
  return option["token"];
};
var choosePackageManager = async () => {
  const option = await (0, import_prompts2.default)({
    name: "selection",
    type: "select",
    message: "Choose your package manager",
    choices: [
      { title: "PNPM", value: "pnpm" },
      { title: "Yarn", value: "yarn" },
      { title: "NPM", value: "npm" }
    ]
  });
  return option["selection"];
};
var chooseTypescript = async () => {
  const option = await (0, import_prompts2.default)({
    name: "selection",
    type: "confirm",
    initial: true,
    message: "Would you like to use Typescript?"
  });
  return option["selection"];
};
var choosePublicFolder = async ({ framework }) => {
  let suggestion = "public";
  switch (framework.name) {
    case "next":
      return "public";
    case "hugo":
      return "static";
    case "jekyll":
      suggestion = "public";
      break;
  }
  const option = await (0, import_prompts2.default)({
    name: "selection",
    type: "text",
    message: `Where are public assets stored? (default: "${suggestion}")
Not sure what value to use? Refer to our "Frameworks" doc: https://tina.io/docs/integration/frameworks/`
  });
  return option["selection"] || suggestion;
};
var chooseFramework = async () => {
  const option = await (0, import_prompts2.default)({
    name: "selection",
    type: "select",
    message: "What framework are you using?",
    choices: [
      { title: "Next.js", value: { name: "next", reactive: true } },
      { title: "Hugo", value: { name: "hugo", reactive: false } },
      { title: "Jekyll", value: { name: "jekyll", reactive: false } },
      {
        title: "Other (SSG frameworks like gatsby, etc.)",
        value: { name: "other", reactive: false }
      }
    ]
  });
  return option["selection"];
};
var forestryMigrate = async ({
  forestryPath,
  rootPath: rootPath2
}) => {
  logger.info(`It looks like you have a ${focusText(".forestry/settings.yml")} file in your project.`);
  const option = await (0, import_prompts2.default)({
    name: "selection",
    type: "confirm",
    initial: true,
    message: `Please note that this is a beta version and may contain some issues
Would you like to migrate your Forestry templates?
${logText("Note: This migration will not be perfect, but it will get you started.")}`
  });
  if (!option["selection"]) {
    return null;
  }
  const collections = await generateCollections({
    forestryPath,
    rootPath: rootPath2
  });
  return JSON.stringify(collections, null, 2);
};
var reportTelemetry = async ({
  hasForestryConfig: hasForestryConfig2,
  noTelemetry,
  usingTypescript
}) => {
  if (noTelemetry) {
    logger.info(logText("Telemetry disabled"));
  }
  const telemetry = new import_metrics3.Telemetry({ disabled: noTelemetry });
  const schemaFileType2 = usingTypescript ? "ts" : "js";
  await telemetry.submitRecord({
    event: {
      name: "tinacms:cli:init:invoke",
      schemaFileType: schemaFileType2,
      hasForestryConfig: hasForestryConfig2
    }
  });
};
var createPackageJSON = async () => {
  logger.info(logText("No package.json found, creating one"));
  await execShellCommand(`npm init --yes`);
};
var createGitignore = async ({ baseDir }) => {
  logger.info(logText("No .gitignore found, creating one"));
  await import_fs_extra10.default.outputFileSync(import_path13.default.join(baseDir, ".gitignore"), "node_modules");
};
var checkGitignoreForNodeModules = async ({
  baseDir
}) => {
  const gitignoreContent = await import_fs_extra10.default.readFileSync(import_path13.default.join(baseDir, ".gitignore")).toString();
  return gitignoreContent.split("\n").some((item) => item === "node_modules");
};
var addNodeModulesToGitignore = async ({ baseDir }) => {
  logger.info(logText("Adding node_modules to .gitignore"));
  const gitignoreContent = await import_fs_extra10.default.readFileSync(import_path13.default.join(baseDir, ".gitignore")).toString();
  const newGitignoreContent = [
    ...gitignoreContent.split("\n"),
    "node_modules"
  ].join("\n");
  await import_fs_extra10.default.writeFileSync(import_path13.default.join(baseDir, ".gitignore"), newGitignoreContent);
};
var addDependencies = async (packageManager) => {
  logger.info(logText("Adding dependencies, this might take a moment..."));
  const deps = ["tinacms", "@tinacms/cli"];
  const packageManagers = {
    pnpm: process.env.USE_WORKSPACE ? `pnpm add ${deps.join(" ")} --workspace` : `pnpm add ${deps.join(" ")}`,
    npm: `npm install ${deps.join(" ")}`,
    yarn: `yarn add ${deps.join(" ")}`
  };
  logger.info(indentedCmd(`${logText(packageManagers[packageManager])}`));
  await execShellCommand(packageManagers[packageManager]);
};
var addConfigFile = async (args) => {
  const { baseDir, usingTypescript } = args;
  const configPath = import_path13.default.join(".tina", `config.${usingTypescript ? "ts" : "js"}`);
  const fullConfigPath = import_path13.default.join(baseDir, configPath);
  if (import_fs_extra10.default.pathExistsSync(fullConfigPath)) {
    const override = await (0, import_prompts2.default)({
      name: "selection",
      type: "confirm",
      message: `Found existing file at ${configPath}. Would you like to override?`
    });
    if (override["selection"]) {
      logger.info(logText(`Overriding file at ${configPath}.`));
      await import_fs_extra10.default.outputFileSync(fullConfigPath, config(args));
    } else {
      logger.info(logText(`Not overriding file at ${configPath}.`));
    }
  } else {
    logger.info(logText(`Adding config file at .tina/config.${usingTypescript ? "ts" : "js"}`));
    await import_fs_extra10.default.outputFileSync(fullConfigPath, config(args));
  }
};
var addContentFile = async ({ baseDir }) => {
  const contentPath = import_path13.default.join("content", "posts", "hello-world.md");
  const fullContentPath = import_path13.default.join(baseDir, contentPath);
  if (import_fs_extra10.default.pathExistsSync(fullContentPath)) {
    const override = await (0, import_prompts2.default)({
      name: "selection",
      type: "confirm",
      message: `Found existing file at ${contentPath}. Would you like to override?`
    });
    if (override["selection"]) {
      logger.info(logText(`Overriding file at ${contentPath}.`));
      await import_fs_extra10.default.outputFileSync(fullContentPath, content);
    } else {
      logger.info(logText(`Not overriding file at ${contentPath}.`));
    }
  } else {
    logger.info(logText(`Adding content file at ${contentPath}`));
    await import_fs_extra10.default.outputFileSync(fullContentPath, content);
  }
};
var logNextSteps = ({
  framework,
  packageManager
}) => {
  logger.info(focusText(`
${titleText(" TinaCMS ")} has been initialized!`));
  logger.info("To get started run: " + cmdText(frameworkDevCmds[framework.name]({ packageManager })));
  logger.info(`
Once your site is running, access the CMS at ${linkText("<YourDevURL>/admin/index.html")}`);
};
var other2 = ({ packageManager }) => {
  const packageManagers = {
    pnpm: `pnpm`,
    npm: `npx`,
    yarn: `yarn`
  };
  const installText = `${packageManagers[packageManager]} tinacms dev -c "<your dev command>"`;
  return installText;
};
var frameworkDevCmds = {
  other: other2,
  hugo: other2,
  jekyll: other2,
  next: ({ packageManager }) => {
    const packageManagers = {
      pnpm: `pnpm`,
      npm: `npm run`,
      yarn: `yarn`
    };
    const installText = `${packageManagers[packageManager]} dev`;
    return installText;
  }
};
var config = (args) => {
  return (0, import_prettier.format)(configExamples[args.framework.name](args));
};
var content = `---
title: Hello, World!
---

## Hello World!

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut non lorem diam. Quisque vulputate nibh sodales eros pretium tincidunt. Aenean porttitor efficitur convallis. Nulla sagittis finibus convallis. Phasellus in fermentum quam, eu egestas tortor. Maecenas ac mollis leo. Integer maximus eu nisl vel sagittis.

Suspendisse facilisis, mi ac scelerisque interdum, ligula ex imperdiet felis, a posuere eros justo nec sem. Nullam laoreet accumsan metus, sit amet tincidunt orci egestas nec. Pellentesque ut aliquet ante, at tristique nunc. Donec non massa nibh. Ut posuere lacus non aliquam laoreet. Fusce pharetra ligula a felis porttitor, at mollis ipsum maximus. Donec quam tortor, vehicula a magna sit amet, tincidunt dictum enim. In hac habitasse platea dictumst. Mauris sit amet ornare ligula, blandit consequat risus. Duis malesuada pellentesque lectus, non feugiat turpis eleifend a. Nullam tempus ante et diam pretium, ac faucibus ligula interdum.
`;
var addReactiveFile = {
  next: ({
    baseDir,
    usingTypescript
  }) => {
    const usingSrc = !import_fs_extra10.default.pathExistsSync(import_path13.default.join(baseDir, "pages"));
    const pagesPath = import_path13.default.join(baseDir, usingSrc ? "src" : "", "pages");
    const packageJSONPath = import_path13.default.join(baseDir, "package.json");
    const tinaBlogPagePath = import_path13.default.join(pagesPath, "demo", "blog");
    const tinaBlogPagePathFile = import_path13.default.join(tinaBlogPagePath, `[filename].${usingTypescript ? "tsx" : "js"}`);
    if (!import_fs_extra10.default.pathExistsSync(tinaBlogPagePathFile)) {
      import_fs_extra10.default.mkdirpSync(tinaBlogPagePath);
      import_fs_extra10.default.writeFileSync(tinaBlogPagePathFile, nextPostPage({ usingSrc }));
    }
    logger.info("Adding a nextjs example... \u2705");
    const pack = JSON.parse(import_fs_extra10.default.readFileSync(packageJSONPath).toString());
    const oldScripts = pack.scripts || {};
    const newPack = JSON.stringify(__spreadProps(__spreadValues({}, pack), {
      scripts: extendNextScripts(oldScripts)
    }), null, 2);
    import_fs_extra10.default.writeFileSync(packageJSONPath, newPack);
  }
};
function execShellCommand(cmd) {
  const exec = require("child_process").exec;
  return new Promise((resolve2, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      }
      resolve2(stdout ? stdout : stderr);
    });
  });
}

// src/cmds/statusChecks/checkClientInformation.ts
var import_progress2 = __toModule(require("progress"));
async function request(args) {
  let data = {};
  const headers = new Headers();
  if (args.token) {
    headers.append("X-API-KEY", args.token);
  }
  headers.append("Content-Type", "application/json");
  const bodyString = JSON.stringify({
    query: args.query,
    variables: (args == null ? void 0 : args.variables) || {}
  });
  const url = args == null ? void 0 : args.url;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: bodyString,
    redirect: "follow"
  });
  const json = await res.json();
  if (!res.ok) {
    let additionalInfo = "";
    if (res.status === 401) {
      additionalInfo = "Please check that your client ID, URL and read only token are configured properly.";
    }
    if (json) {
      additionalInfo += `

Message from server: ${json.message}`;
    }
    throw new Error(`Server responded with status code ${res.status}, ${res.statusText}. ${additionalInfo ? additionalInfo : ""} Please see our FAQ for more information: https://tina.io/docs/errors/faq/`);
  }
  if (json.errors) {
    throw new Error(`Unable to fetch, please see our FAQ for more information: https://tina.io/docs/errors/faq/

      Errors: 
	${json.errors.map((error) => error.message).join("\n")}`);
  }
  return {
    data: json == null ? void 0 : json.data,
    query: args.query
  };
}
var checkClientInfo = async (ctx, next, _options) => {
  var _a;
  const config2 = (_a = ctx.schema) == null ? void 0 : _a.config;
  const token = config2.token;
  const url = ctx.apiUrl;
  const bar = new import_progress2.default("Checking clientId, token and branch. :prog", 1);
  try {
    await request({
      token,
      url,
      query: `query {
        collections {
          name
        }
      }`
    });
    bar.tick({
      prog: "\u2705"
    });
  } catch (e) {
    bar.tick({
      prog: "\u274C"
    });
    console.warn(`Error when checking client information. You provided 

 ${JSON.stringify({
      branch: config2 == null ? void 0 : config2.branch,
      clientId: config2 == null ? void 0 : config2.clientId,
      token: config2 == null ? void 0 : config2.token
    }, null, 2)}

 Please check you have the correct "clientId", "branch" and "token" configured. For more information see https://tina.io/docs/tina-cloud/connecting-site/`);
    throw e;
  }
  next();
};

// src/cmds/baseCmds.ts
var CMD_START_SERVER = "server:start";
var CMD_DEV = "dev";
var INIT = "init";
var AUDIT = "audit";
var CMD_BUILD = "build";
var startServerPortOption = {
  name: "--port <port>",
  description: "Specify a port to run the server on. (default 4001)"
};
var experimentalDatalayer = {
  name: "--experimentalData",
  description: "Build the server with additional data querying capabilities"
};
var isomorphicGitBridge = {
  name: "--isomorphicGitBridge",
  description: "Enable Isomorphic Git Bridge Implementation"
};
var schemaFileType = {
  name: "--schemaFileType [fileType]",
  description: "The file type to use for the Tina schema"
};
var subCommand = {
  name: "-c, --command <command>",
  description: "The sub-command to run"
};
var noWatchOption = {
  name: "--noWatch",
  description: "Don't regenerate config on file changes"
};
var noSDKCodegenOption = {
  name: "--noSDK",
  description: "Don't generate the generated client SDK"
};
var cleanOption = {
  name: "--clean",
  description: "Updates all content files to remove any data not explicitly permitted by the current schema definition"
};
var useDefaultValuesOption = {
  name: "--useDefaultValues",
  description: "Adds default values to the graphQL mutation so that default values can be filled into existing documents (useful for adding a field with `required: true`)"
};
var noTelemetryOption = {
  name: "--noTelemetry",
  description: "Disable anonymous telemetry that is collected"
};
var watchFileOption = {
  name: "-w, --watchFolders [folders...]",
  description: "a list of folders (relative to where this is being run) that the cli will watch for changes"
};
var verboseOption = {
  name: "-v, --verbose",
  description: "increase verbosity of logged output",
  defaultValue: false
};
var developmentOption = {
  name: "--dev",
  description: "Uses NODE_ENV=development when compiling client and schema"
};
var localOption = {
  name: "--local",
  description: "Uses the local file system graphql server",
  defaultValue: false
};
var checkOptions = async (_ctx, next, options) => {
  if (options == null ? void 0 : options.experimentalData) {
    logger.warn(warnText("Warning: you are using the `--experimentalData`flag. This flag is not needed and can safely be removed. It will be deprecated in a future version"));
  }
  next();
};
var baseCmds = [
  {
    command: CMD_START_SERVER,
    description: "Start Filesystem Graphql Server",
    options: [
      startServerPortOption,
      subCommand,
      experimentalDatalayer,
      isomorphicGitBridge,
      noWatchOption,
      noSDKCodegenOption,
      noTelemetryOption,
      watchFileOption,
      verboseOption,
      developmentOption,
      localOption
    ],
    action: (options) => chain([
      attachPath,
      async (ctx, next, _2) => {
        logger.warn(warnText("server:start will be deprecated in the future, please use `tinacms dev` instead"));
        next();
      },
      checkOptions,
      buildSetupCmdServerStart,
      startServer,
      startSubprocess
    ], options)
  },
  {
    command: CMD_DEV,
    description: "Builds tina and starts the dev server.",
    options: [
      startServerPortOption,
      subCommand,
      isomorphicGitBridge,
      noWatchOption,
      noSDKCodegenOption,
      noTelemetryOption,
      watchFileOption,
      verboseOption
    ],
    action: (options) => chain([
      attachPath,
      checkOptions,
      buildSetupCmdServerStart,
      startServer,
      startSubprocess
    ], options)
  },
  {
    command: CMD_BUILD,
    description: "Build Tina",
    options: [
      experimentalDatalayer,
      isomorphicGitBridge,
      noSDKCodegenOption,
      noTelemetryOption,
      verboseOption,
      developmentOption,
      localOption
    ],
    action: (options) => chain([
      attachPath,
      checkOptions,
      buildSetupCmdBuild,
      buildCmdBuild,
      checkClientInfo,
      waitForDB
    ], options)
  },
  {
    command: INIT,
    options: [
      experimentalDatalayer,
      isomorphicGitBridge,
      noTelemetryOption,
      schemaFileType
    ],
    description: "Add Tina Cloud to an existing project",
    action: (options) => {
      chain([attachPath, checkOptions, initStaticTina], options);
    }
  },
  {
    options: [
      cleanOption,
      useDefaultValuesOption,
      noTelemetryOption,
      verboseOption
    ],
    command: AUDIT,
    description: "Audit your schema and the files to check for errors",
    action: (options) => chain([
      attachPath,
      buildSetupCmdAudit,
      auditCmdBuild,
      async (_ctx, next) => {
        logger.level = "info";
        logger.info(import_chalk4.default.hex("#eb6337").bgWhite("Welcome to tina audit \u{1F999}"));
        next();
      },
      audit,
      printFinalMessage
    ], options)
  }
];

// src/index.ts
var program = new commander.Command(name);
var registerCommands = (commands, noHelp = false) => {
  commands.forEach((command, i) => {
    let newCmd = program.command(command.command, { noHelp }).description(command.description).action((...args) => {
      command.action(...args);
    });
    if (command.alias) {
      newCmd = newCmd.alias(command.alias);
    }
    newCmd.on("--help", function() {
      if (command.examples) {
        logger.info(`
Examples:
  ${command.examples}`);
      }
      if (command.subCommands) {
        logger.info("\nCommands:");
        const optionTag = " [options]";
        command.subCommands.forEach((subcommand, i2) => {
          const commandStr = `${subcommand.command}${(subcommand.options || []).length ? optionTag : ""}`;
          const padLength = Math.max(...command.subCommands.map((sub) => sub.command.length)) + optionTag.length;
          logger.info(`${commandStr.padEnd(padLength)} ${subcommand.description}`);
        });
      }
      logger.info("");
    });
    (command.options || []).forEach((option) => {
      newCmd.option(option.name, option.description, option == null ? void 0 : option.defaultValue);
    });
    if (command.subCommands) {
      registerCommands(command.subCommands, true);
    }
  });
};
async function init(args) {
  program.version(version);
  const commands = [...baseCmds];
  registerCommands(commands);
  program.usage("command [options]");
  program.on("command:*", function() {
    logger.error("Invalid command: %s\nSee --help for a list of available commands.", args.join(" "));
    process.exit(1);
  });
  program.on("--help", function() {
    logger.info(logText(`
You can get help on any command with "-h" or "--help".
e.g: "tinacms server:start --help"
    `));
  });
  if (!process.argv.slice(2).length) {
    program.help();
  }
  program.parse(args);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  defineSchema,
  init
});
