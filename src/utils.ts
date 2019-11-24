import {
  BaseSchema,
  Reference,
  Operation,
  Schema
} from "swagger-schema-official";
import { InterfaceType, Method } from "./type";

export const requestMethods = [
  "get",
  "post",
  "patch",
  "put",
  "delete"
] as const;

// helper fn
export const identity = <T>(x: T) => x;
export const noop = () => {};

export function isRef(x: any): x is Reference {
  return "$ref" in x;
}

// parser fn
export const getFuncDesc = (op: Operation) => {
  const desc = `${op.summary ||
    (op.tags === undefined ? "" : op.tags.join())} ${op.description ||
    ""}`.trim();
  return desc ? desc : undefined;
};

export const getEnumType = (schema: BaseSchema) => {
  if (schema.enum === undefined) return undefined;
  // uniq, sort
  let enums = [...new Set(schema.enum)];
  switch (schema.type) {
    case "string":
      enums = (<string[]>enums).map(item => `"${item}"`);
      break;

    case "integer":
    case "number":
      enums = (<number[]>enums).map(item => `${item}`);
      break;
    case "boolean":
      enums = (<boolean[]>enums).map(item => (item ? "true" : "false"));
      break;
  }
  return enums.join("|");
};

export const capitalize = (word: string) => {
  return word.replace(/^[a-z]/, word => word.toUpperCase());
};

export const apiNameMapper = (path: string, method: Method) => {
  const seg = path
    .replace(/(^\/)|(\/$)|[{}]/g, "")
    .replace(/[\/_-](\w)/g, (_, word: string) => word.toUpperCase());
  return `${method}${capitalize(seg)}`;
};

export const interfaceNameMapper = (apiName: string, type: InterfaceType) => {
  return `${capitalize(apiName)}${capitalize(type)}`;
};

export const responseInterceptor = (schema: Schema): Schema => {
  return schema;
};
