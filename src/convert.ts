import { Option, Part, Method, InterfaceType } from "./type";

import {
  apiNameMapper,
  interfaceNameMapper,
  responseInterceptor
} from "./utils";
import { Spec, Tag, Schema } from "swagger-schema-official";
import { ModuleDef } from "./defs/module";
import { writer } from "./writer";

const defaultOption = {
  tagMapper: () => undefined,
  apiNameMapper,
  tplRoot: __dirname + "/template",
  templates: {},
  skipBodyOfGet: true,
  interfaceNameMapper,
  responseInterceptor,
  out: ""
};

export const convert = async (swagger: Spec, options: Option) => {
  const finalOptions: Required<Option> = { ...defaultOption, ...options };
  const module = new ModuleDef(swagger, finalOptions);
  await writer(
    finalOptions.out,
    module.toString().replace(/\s*\n(\s*\n)+/gm, "\n"),
    {
      encoding: "utf8"
    }
  );
  console.log("done");
};
