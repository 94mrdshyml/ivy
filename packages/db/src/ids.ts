import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 24);

export const generateId = (prefix: string) => `${prefix}_${nanoid()}`;

export const ids = {
  org: () => generateId("org"),
  usr: () => generateId("usr"),
  mem: () => generateId("mem"),
  inv: () => generateId("inv"),
  acc: () => generateId("acc"),
  aud: () => generateId("aud"),
  igacc: () => generateId("igacc"),
  igmet: () => generateId("igmet"),
  igpst: () => generateId("igpst"),
  lp: () => generateId("lp"),
  lnk: () => generateId("lnk"),
  lclk: () => generateId("lclk"),
  sp: () => generateId("sp"),
};
