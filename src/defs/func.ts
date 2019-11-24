import { Into, InterfaceType, Option, Method } from "../type";
import {
  Operation,
  QueryParameter,
  BodyParameter,
  PathParameter,
  FormDataParameter
} from "swagger-schema-official";
import { getFuncDesc, isRef } from "../utils";
import {
  InterfaceDef,
  QueryInterfaceDef,
  PathInterfaceDef,
  FormDataInterfaceDef,
  BodyInterfaceDef,
  ResponseInterfaceDef
} from "./interface";
import { render } from "../writer";

export interface FuncDefProps {
  path: string;
  operation: Operation;
  method: Method;
}

export interface FuncParams {
  description?: string;
  interfaces: string[];
  name: string;
  url: string;
  method: string;
  query?: string;
  body?: string;
  path?: string;
  response?: string;
}
export class FuncDef implements Into<FuncParams> {
  private readonly interfaces: Map<InterfaceType, InterfaceDef> = new Map();
  private readonly name: string;
  private readonly url: string;
  private readonly description?: string;
  private readonly method: Method;
  private readonly operation: Operation;
  constructor(props: FuncDefProps, private options: Required<Option>) {
    this.name = options.apiNameMapper(props.path, props.method);
    this.description = getFuncDesc(props.operation);
    this.url = props.path;
    this.method = props.method;
    this.operation = props.operation;
    this.collect();
  }

  private addQueryInterfaces(queries: QueryParameter[]) {
    if (queries.length === 0) return;
    this.interfaces.set(
      "query",
      new QueryInterfaceDef(this.name, this.description, queries, this.options)
    );
  }

  private addPathInterfaces(paths: PathParameter[]) {
    if (paths.length === 0) return;
    this.interfaces.set(
      "path",
      new PathInterfaceDef(this.name, this.description, paths, this.options)
    );
  }

  private addBodyInterfaces(bodies: BodyParameter[]) {
    if (bodies.length === 0) return;
    this.interfaces.set(
      "body",
      new BodyInterfaceDef(this.name, this.description, bodies, this.options)
    );
  }

  private addFormDataInterfaces(formData: FormDataParameter[]) {
    if (formData.length === 0) return;
    this.interfaces.set(
      "formData",
      new FormDataInterfaceDef(
        this.name,
        this.description,
        formData,
        this.options
      )
    );
  }

  collect() {
    const queries: QueryParameter[] = [];
    const bodies: BodyParameter[] = [];
    const paths: PathParameter[] = [];
    const formData: FormDataParameter[] = [];

    if (this.operation.parameters === undefined) return;
    for (const parameter of this.operation.parameters) {
      if (isRef(parameter)) {
        console.warn("ref is not supported by now");
        continue;
      }
      if (parameter.in === "query") {
        queries.push(parameter);
      } else if (parameter.in === "body") {
        if (this.method !== "get" || !this.options.skipBodyOfGet) {
          bodies.push(parameter);
        }
      } else if (parameter.in === "path") {
        paths.push(parameter);
      } else if (parameter.in === "formData") {
        formData.push(parameter);
      }
    }

    this.addQueryInterfaces(queries);

    this.addPathInterfaces(paths);

    this.addBodyInterfaces(bodies);

    this.addFormDataInterfaces(formData);

    this.interfaces.set(
      "response",
      new ResponseInterfaceDef(
        this.name,
        this.description,
        this.operation.responses,
        this.options
      )
    );
  }

  into() {
    const interfaces: string[] = [];
    const interNames: Partial<Record<InterfaceType, string>> = {};
    for (const [key, iface] of this.interfaces.entries()) {
      const name = iface.getSimpleType();
      if (name) interNames[key] = name;
      else {
        const str = iface.toString();
        if (str) {
          interNames[key] = iface.interfaceName;
          interfaces.push(str);
        }
      }
    }
    return {
      description: this.description,
      name: this.name,
      url: this.url,
      method: this.method,
      // default response type is any
      // response: "any",
      ...interNames,
      interfaces
    };
  }
  toString() {
    return render("func", this.into(), this.options);
  }
}
