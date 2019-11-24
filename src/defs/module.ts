import { Spec, Tag } from "swagger-schema-official";
import { Option, Method } from "../type";
import { requestMethods } from "../utils";
import { ClassDef } from "./class";
import { FuncDef } from "./func";
import { Into } from "../type";
import { render } from "../writer";

export interface ModuleParams {
  classes: string[];
  date: string;
  basePath: string;
}

export class ModuleDef implements Into<ModuleParams> {
  private readonly commonkey = "common";
  private readonly records = new Map<string, string>([
    [this.commonkey, this.commonkey]
  ]);

  private readonly classes = new Map<string, ClassDef>();
  constructor(private swagger: Spec, private options: Required<Option>) {
    this.createClassDefs(swagger.tags || []);
    this.travelApis(swagger.paths);
  }

  private createClassDefs(tags: Tag[]) {
    if (tags.length === 0) tags.push({ name: this.commonkey });
    for (const [index, tag] of tags.entries()) {
      const name =
        this.records.get(tag.name) ||
        this.options.tagMapper(tag.name) ||
        `tag${index}`;
      const description = `${tag.name} ${tag.description}`;
      this.records.set(tag.name, name);
      let def = this.classes.get(name);
      if (def) {
        def.merge(description);
      } else {
        def = new ClassDef(this.options, name, description);
        this.classes.set(name, def);
      }
    }
  }

  private travelApis(apis: Spec["paths"]) {
    for (const [pathname, path] of Object.entries(apis)) {
      for (const key of Object.keys(path)) {
        if (requestMethods.includes(key as any)) {
          const method = key as Method;
          const operation = path[method]!;
          const funcDef = new FuncDef(
            { path: pathname, operation, method },
            this.options
          );

          const tags =
            !operation.tags || !operation.tags.length
              ? ["common"]
              : operation.tags;

          for (const tag of tags) {
            const name = this.records.get(tag) || "common";
            const classDef = this.classes.get(name)!;
            classDef.addMethod(funcDef);
          }
        }
      }
    }
  }
  into() {
    const classes = [];
    for (const cls of this.classes.values()) {
      classes.push(cls.toString());
    }

    return {
      date: new Date().toDateString(),
      classes,
      basePath: this.swagger.basePath || "/"
    };
  }
  toString(): string {
    return render("module", this.into(), this.options);
  }
}
