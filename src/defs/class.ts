import { Option } from "../type";
import { Into } from "../type";
import { FuncDef } from "./func";
import { render } from "../writer";

export interface ClassParams {
  methods: string[];
  name: string;
  description?: string;
}
export class ClassDef implements Into<ClassParams> {
  private readonly methods: FuncDef[] = [];

  private descriptions: string[] = [];

  addMethod(method: FuncDef) {
    this.methods.push(method);
  }

  getName() {
    return this.name;
  }

  merge(description?: string) {
    if (description) this.descriptions.push(description);
  }

  constructor(
    private options: Required<Option>,
    private name: string,
    description?: string
  ) {
    if (description) this.descriptions.push(description);
  }

  into() {
    return {
      name: this.name,
      description: this.descriptions.join("\n"),
      methods: this.methods
        .map(method => method.toString())
        .filter(method => method)
    };
  }

  toString() {
    return render("class", this.into(), this.options);
  }
}
