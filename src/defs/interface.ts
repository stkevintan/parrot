import {
  Into,
  Field,
  InterfaceType,
  Option,
  CommonField,
  ObjectField,
  ArrayField
} from "../type";
import {
  QueryParameter,
  PathParameter,
  BodyParameter,
  Schema,
  FormDataParameter,
  Operation
} from "swagger-schema-official";
import { getEnumType, isRef } from "../utils";
import { render } from "../writer";

export interface InterfaceParams {
  name: string;
  description?: string;
  field?: Field;
}

export abstract class InterfaceDef implements Into<InterfaceParams> {
  protected abstract readonly type: InterfaceType;
  protected abstract field?: Field;
  constructor(
    private name: string,
    private description: string | undefined,
    private options: Required<Option>
  ) {}

  // abstract getField(): Field | undefined;

  getSimpleType = (field = this.field, isDep = false): string | undefined => {
    if (!field) return undefined;
    if (field.type === "object") {
      if (isDep) return undefined;
      const props = (field as ObjectField).properties;
      if (props.length === 0) return "{}";
      if (props.length === 1) {
        const depType = this.getSimpleType(props[0], true);
        if (depType) return `{${props[0].name}: ${depType}}`;
      }
      return undefined;
    }
    if (field.type === "array") {
      const depType = this.getSimpleType((field as ArrayField).items);
      if (depType) return `Array<${depType}>`;
      else return undefined;
    }
    return field.type;
  };

  get interfaceName() {
    return (
      this.getSimpleType() ??
      this.options.interfaceNameMapper(this.name, this.type)
    );
  }

  protected schema2Field = (schema: Schema, name: string = "root"): Field => {
    const { description } = schema;
    if (schema.type === "object") {
      const { properties = {}, required = [] } = schema;
      return {
        name,
        description,
        type: "object",
        properties: Object.keys(properties).map(name => {
          const schema = this.schema2Field(properties[name], name);
          schema.required = required.includes(name);
          return schema;
        })
      };
    }
    if (schema.type === "array") {
      return {
        name,
        description,
        type: "array",
        // yapi cannot generate oneof
        items: this.schema2Field(schema.items as Schema)
      };
    }

    const enumType = getEnumType(schema);
    if (enumType !== undefined) return { name, type: enumType, description };
    const type: string | undefined =
      schema.type === "integer" ? "number" : schema.type;
    return { name, type: type || "unknown", description };
  };

  into() {
    return {
      name: this.interfaceName,
      description: this.description,
      field: this.field
    };
  }

  toString() {
    if (this.getSimpleType() !== undefined) return "";
    const params = this.into();
    if (params.field === undefined) return "";
    return render("interface", params, this.options);
  }
}

export class QueryInterfaceDef extends InterfaceDef {
  readonly type = "query";
  field: CommonField | undefined = undefined;
  constructor(
    name: string,
    description: string | undefined,
    private queries: QueryParameter[],
    options: Required<Option>
  ) {
    super(name, description, options);
    this.field = this.getField();
  }

  getField() {
    const properties: Field[] = this.queries
      .map(query => {
        const { description, name, required, type } = query;
        // const name = getFieldName(query)
        //Notice: swagger from yapi's query should only has type string without enum
        if (type === "string") {
          return <Field>{ name, required, type: "string", description };
        }
        return undefined;
      })
      .filter((x): x is Field => x !== undefined);

    return properties.length
      ? { name: "root", type: "object", properties }
      : undefined;
  }
}

// https://github.com/YMFE/yapi/blob/master/exts/yapi-plugin-export-swagger2-data/controller.js#L177
export class PathInterfaceDef extends InterfaceDef {
  readonly type = "path";
  field: CommonField | undefined = undefined;
  constructor(
    name: string,
    description: string | undefined,
    private paths: PathParameter[],
    options: Required<Option>
  ) {
    super(name, description, options);
    this.field = this.getField();
  }

  getField() {
    const properties = this.paths
      .map(path => {
        const { type, name, required, description } = path;
        if (type === "string") {
          // only string
          return <Field>{ name, required, type: "string", description };
        }
        return undefined;
      })
      .filter((x): x is Field => x !== undefined);

    return properties.length
      ? { name: "root", type: "object", properties }
      : undefined;
  }
}

export class FormDataInterfaceDef extends InterfaceDef {
  readonly type = "formData";
  field: CommonField | undefined = undefined;
  constructor(
    name: string,
    description: string | undefined,
    private formData: FormDataParameter[],
    options: Required<Option>
  ) {
    super(name, description, options);
    this.field = this.getField();
  }

  getField() {
    if (this.formData.length === 0) return undefined;
    const properties = this.formData.map(form => {
      const { type, name, required, description } = form;
      let tsType = "unknown";
      if (type === "string") {
        tsType = "string";
      } else if (<string>type === "file") {
        tsType = "Blob";
      }
      return <Field>{
        name,
        required,
        type: tsType,
        description
      };
    });
    return properties.length
      ? { name: "root", type: "object", properties }
      : undefined;
  }
}

export class BodyInterfaceDef extends InterfaceDef {
  readonly type = "body";
  field?: CommonField;
  constructor(
    name: string,
    description: string | undefined,
    private bodies: BodyParameter[],
    options: Required<Option>
  ) {
    super(name, description, options);
    this.field = this.getField();
  }

  getField() {
    // bodies only parser the first one.
    if (this.bodies[0] === undefined || this.bodies[0].schema === undefined)
      return undefined;
    const schema = this.bodies[0].schema;
    return this.schema2Field(schema);
  }
}

export class ResponseInterfaceDef extends InterfaceDef {
  readonly type = "response";
  private schema?: Schema;
  field?: CommonField;
  constructor(
    name: string,
    description: string | undefined,
    response: Operation["responses"],
    options: Required<Option>
  ) {
    super(name, description, options);
    const successRes = response["200"];
    if (isRef(successRes)) {
      console.warn("ref is not supported by now");
      return;
    }
    if (successRes.schema) {
      this.schema = options.responseInterceptor(successRes.schema);
    }
    this.field = this.getField();
  }
  getField() {
    if (this.schema === undefined) return undefined;
    return this.schema2Field(this.schema);
  }
}
