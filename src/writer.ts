import fs from "fs";
import path from "path";
import nunjunks from "nunjucks";
import { Part, Option } from "./type";
import { FuncParams } from "./defs/func";
import { ClassParams } from "./defs/class";
import { ModuleParams } from "./defs/module";
import { InterfaceParams } from "./defs/interface";
import { promisify } from "util";
// export class Writer {
//   private out?: fs.WriteStream
//   private buffer: string[]
//   constructor(private path?: string) {
//     this.buffer = []
//     if (path) {
//       this.out = fs.createWriteStream(path)
//     }
//   }
//   push = (str?: string) => {
//     if (str === undefined) return
//     this.buffer.push(str)
//     if (this.out) {
//       this.out.write(str)
//     }
//   }

//   valueOf = () => {
//     return this.buffer.join('')
//   }

//   toString = () => {
//     return this.valueOf()
//   }

//   done = () => {
//     if (this.out) {
//       this.out.end()
//     }
//   }
// }

const env = nunjunks.configure({
  autoescape: false,
  throwOnUndefined: false
});

type ParamsType<K extends Part> = {
  // header: HeaderParams;
  interface: InterfaceParams;
  func: FuncParams;
  class: ClassParams;
  module: ModuleParams;
}[K];
export function render<K extends Part>(
  part: K,
  params: ParamsType<K>,
  options: Required<Option>
) {
  const { templates, tplRoot } = options;
  const templatePath = templates[part] ?? path.join(tplRoot, `${part}.njk`);
  return env.renderString(
    fs.readFileSync(templatePath, { encoding: "utf8" }),
    params
  );
}

export const writer = promisify(fs.writeFile);
