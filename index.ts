import {
  shopgetname,
  shopgetconvention,
  shopsavename,
} from "./handlers/IIDXshop";
import {
  pccommon,
  pcoldget,
  pcreg,
  pcget,
  pcsave,
  pctakeover,
  pcgetname,
} from "./handlers/IIDXpc";
import {
  effect_list,
  frame_list,
  fullcombo_list,
  judge_list,
  keybeam_list,
  lanecover_list,
  menumusic_list,
  noteburst_list,
  notes_list,
  turntable_list,
} from "./data/27customlist";
import {
  musicreg,
  musicgetrank,
  musicappoint,
  musiccrate,
} from "./handlers/IIDXmusic";
import { graderaised } from "./handlers/IIDXgrade";
import { bombsize_list, first_note_preview_list } from "./data/27customlist";
import { ShopRanking_list } from "./data/settingslist";

export function register() {
  R.Contributor("sol#1207", "https://twitter.com/0x1F5");

  R.Config("ShopRanking", {
    type: "string",
    default: "PersonalBest",
    options: ShopRanking_list,
  });
  R.Config("frame", {
    type: "string",
    default: "デフォルト",
    options: frame_list,
  });
  R.Config("menu_music", {
    type: "string",
    default: "デフォルト",
    options: menumusic_list,
  });
  R.Config("note_burst", {
    type: "string",
    default: "デフォルト",
    options: noteburst_list,
  });

  R.Config("turntable", {
    type: "string",
    default: "デフォルト",
    options: turntable_list,
  });

  R.Config("lane_cover", {
    type: "string",
    default: "デフォルト",
    options: lanecover_list,
  });
  R.Config("pacemaker_cover", {
    type: "string",
    default: "デフォルト",
    options: lanecover_list,
  });
  R.Config("note_skin", {
    type: "string",
    default: "デフォルト",
    options: notes_list,
  });
  R.Config("judge_font", {
    type: "string",
    default: "デフォルト",
    options: judge_list,
  });
  R.Config("note_beam", {
    type: "string",
    default: "デフォルト",
    options: keybeam_list,
  });
  R.Config("full_combo_splash", {
    type: "string",
    default: "デフォルト",
    options: fullcombo_list,
  });
  R.Config("score_folders", { type: "boolean", default: true });
  R.Config("clear_folders", { type: "boolean", default: true });
  R.Config("difficulty_folders", { type: "boolean", default: true });
  R.Config("alphabet_folders", { type: "boolean", default: true });
  R.Config("hide_playcount", { type: "boolean", default: false });
  R.Config("disable_graphcutin", { type: "boolean", default: false });
  R.Config("classic_hispeed", { type: "boolean", default: false });
  R.Config("hide_iidxid", { type: "boolean", default: false });
  R.Config("disable_musicpreview", { type: "boolean", default: false });
  R.Config("vefx_lock", { type: "boolean", default: false });
  R.Config("effect", {
    type: "string",
    default: "OFF",
    options: effect_list,
  });
  R.Config("bomb_size", {
    type: "string",
    default: "100%",
    options: bombsize_list,
  });
  R.Config("disable_hcn_color", { type: "boolean", default: false });
  R.Config("first_note_preview", {
    type: "string",
    default: "default",
    options: first_note_preview_list,
  });

  R.Config("qpro_head", { type: "integer", default: 0 });
  R.Config("qpro_hair", { type: "integer", default: 0 });
  R.Config("qpro_hand", { type: "integer", default: 0 });
  R.Config("qpro_face", { type: "integer", default: 0 });
  R.Config("qpro_body", { type: "integer", default: 0 });

  R.GameCode("LDJ");
  const MultiRoute = (method: string, handler: EPR | boolean) => {
    // Helper for register multiple versions.
    R.Route(`IIDX27${method}`, handler);
    R.Route(`IIDX28${method}`, handler);
    R.Route(`IIDX29${method}`, handler);
    //R.Route(`IIDXのバージョン${method}`, handler);
  };

  //pc
  MultiRoute("pc.get", pcget);
  MultiRoute("pc.reg", pcreg);
  //MultiRoute("pc.lcommon", true);
  MultiRoute("pc.save", pcsave);
  MultiRoute("pc.getname", pcgetname);
  //MultiRoute("pc.locaend", true);
  MultiRoute("pc.common", pccommon);
  MultiRoute("pc.takeover", pctakeover);
  //MultiRoute("pc.playstart", true);
  //MultiRoute("pc.playend", true);
  MultiRoute("pc.delete", true);
  //MultiRoute("pc.visit", true);
  //MultiRoute("pc.shopregister", true);
  MultiRoute("pc.oldget", pcoldget);
  MultiRoute("pc.eaappliresult", true);
  MultiRoute("pc.eaappliexpert", true);
  MultiRoute("pc.logout", true);
  //MultiRoute("pc.qrreward", true);
  //MultiRoute("pc.qrcompe", true);
  //MultiRoute("pc.qrfollow", true);

  //music
  MultiRoute("music.getrank", musicgetrank);
  //MultiRoute("music.lplay", true);
  //MultiRoute("music.play", true);
  MultiRoute("music.reg", musicreg);
  MultiRoute("music.crate", musiccrate);
  MultiRoute("music.appoint", musicappoint);
  //MultiRoute("music.nosave", true);
  //MultiRoute("music.arenaCPU", true);

  //grade
  MultiRoute("grade.raised", graderaised);

  //shop
  MultiRoute("shop.sentinfo", true);
  //MultiRoute("shop.keepalive", true);
  MultiRoute("shop.savename", shopsavename);
  MultiRoute("shop.getname", shopgetname);
  //MultiRoute("shop.setconvention", true);
  MultiRoute("shop.getconvention", shopgetconvention);
  //MultiRoute("shop.sendpcbdetail", true);
  MultiRoute("shop.sendescapepackageinfo", true);
  //MultiRoute("shop.recoveryfilelog", true);

  //ranking
  //MultiRoute("ranking.entry", true);
  //MultiRoute("ranking.oentry", true);
  MultiRoute("ranking.getranker", true);
  //MultiRoute("ranking.classicentry", true);
  //MultiRoute("ranking.conventionentry", true);

  //lobby
  //MultiRoute("lobby.entry", true);
  //MultiRoute("lobby.update", true);
  //MultiRoute("lobby.delete", true);

  //gameSystem
  MultiRoute("gameSystem.systemInfo", true);

  R.Unhandled();
}
