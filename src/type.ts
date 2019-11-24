import { Spec, Schema, Operation, Parameter } from "swagger-schema-official";
import { requestMethods } from "./utils";

export type ObjectOf<T> = { [key: string]: T };

export interface Into<T> {
  toString(): string;
  into(): T | undefined;
}

// export interface TagDescr {
//   name: string;
//   description?: string;
//   apis: { name: string; description?: string }[];
// }

export interface ArrayField extends CommonField {
  type: "array";
  items: Field;
}

export interface ObjectField extends CommonField {
  type: "object";
  properties: Field[];
}

export interface CommonField {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
}
export type Field = CommonField | ObjectField | ArrayField;

// export interface Self {
//   op: Operation;
//   getName: (type: InterfaceType) => string;
// }

// export type ParameterHandler<T extends Parameter = Parameter> = (
//   env: Self,
//   data: T[]
// ) => InterfaceParams[];

export type Method = typeof requestMethods[number];

export type Part = "interface" | "func" | "class" | "module";

export interface Option {
  tagMapper?: (tag: string) => string | undefined;
  tplRoot?: string;
  templates?: {
    [key in Part]?: string;
  };
  apiNameMapper?: (path: string, method: Method) => string;
  interfaceNameMapper?: (apiName: string, type: InterfaceType) => string;
  responseInterceptor?: (schema: Schema) => Schema;
  out?: string;
  skipBodyOfGet?: boolean;
}

// export interface HeaderParams {
//   date: string;
//   basePath: string;
// }

// export interface Context {
//   swagger: Spec;
//   renders: {
//     header: (params: HeaderParams) => string;
//     interface: (params: InterfaceParams) => string;
//     fn: (params: FnParams) => string;
//     body: (params: BodyParams) => string;
//   };
//   // fns: Map<string, FnDescr>
//   options: Required<Option>;
//   writer: Writer;
// }
// export interface RenderContext extends Context {
//   method: Method;
//   apiName: string;
//   operation: Operation;
//   description?: string;
// }
export type InterfaceType = "query" | "path" | "body" | "formData" | "response";
