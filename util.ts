import { profile } from "./models/profile";
import { Profile } from "../sdvx@asphyxia/models/profile";

export function IDToCode(id: number) {
  const padded = _.padStart(id.toString(), 8);
  return `${padded.slice(0, 4)}-${padded.slice(4)}`;
}

export function base64decode(s: string) {
  const base64list =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  let t = "",
    p = -8,
    a = 0,
    c: number,
    d: number;

  for (let i = 0; i < s.length; i++) {
    if ((c = base64list.indexOf(s.charAt(i))) < 0) continue;
    a = (a << 6) | (c & 63);
    if ((p += 6) >= 0) {
      d = (a >> p) & 255;
      if (c != 64) t += String.fromCharCode(d);
      a &= 63;
      p -= 8;
    }
  }
  return t;
}

export function GetVersion(info: EamuseInfo) {
  return parseInt(info.module.substr(4, 2));
}

export async function IIDXidTorefid(iidxid: number) {
  const profile = await DB.FindOne<profile>(null, {
    collection: "profile",
    iidxid: iidxid,
  });
  return profile.refid;
}

export function ClidToRank(clid: number) {
  let style: number, rank: number;
  if (clid >= 5) {
    style = 1;
    rank = clid - 5;
  } else {
    style = 0;
    rank = clid;
  }
  return {
    style: style,
    rank: rank,
  };
}

export function AppendSettingConverter(
  sf: boolean,
  cf: boolean,
  df: boolean,
  af: boolean,
  hp: boolean,
  dg: boolean,
  ch: boolean,
  hi: boolean
) {
  const result =
    Number(sf) * 1 +
    Number(cf) * 2 +
    Number(df) * 4 +
    Number(af) * 8 +
    Number(hp) * 256 +
    Number(dg) * 512 +
    Number(ch) * 1024 +
    Number(hi) * 4196;
  return result;
}

export function DateToName(now: number, score_time: number) {
  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;
  const msPerDay = msPerHour * 24;
  const msPerMonth = msPerDay * 30;
  const msPerYear = msPerDay * 365;

  const elapsed = now - score_time;

  if (elapsed < msPerMinute) {
    return "-" + Math.round(elapsed / 1000) + "s";
  } else if (elapsed < msPerHour) {
    return "-" + Math.round(elapsed / msPerMinute) + "m";
  } else if (elapsed < msPerDay) {
    return "-" + Math.round(elapsed / msPerHour) + "h";
  } else if (elapsed < msPerMonth) {
    return "-" + Math.round(elapsed / msPerDay) + "d";
  } else if (elapsed < msPerYear) {
    return "-" + Math.round(elapsed / msPerMonth) + "mo";
  } else {
    return "-" + Math.round(elapsed / msPerYear) + "yr";
  }
}

export async function refidToName(refid: string) {
  const profile = await DB.FindOne<profile>(refid, {
    collection: "profile",
  });
  return profile.name;
}
