import { settings } from "../models/settings";
import { pc_data, IIDX27_pc_data} from "../models/pc_data";
import { shop_data } from "../models/shop_data";
import { profile } from "../models/profile";
import { grade } from "../models/grade";
import { GetVersion, IDToCode, AppendSettingConverter } from "../util";
import {
  first_note_preview_list,
  bombsize_list,
  effect_list,
} from "../data/27customlist";
import {
  frame_list,
  fullcombo_list,
  judge_list,
  keybeam_list,
  lanecover_list,
  menumusic_list,
  noteburst_list,
  notes_list,
  turntable_list,
} from "../data/27customlist";

export const pccommon: EPR = async (info, data, send) => {
  const version = GetVersion(info);
  if (version == 27) {
    send.pugFile("pug/27pccommon.pug");
  }
};

export const pcoldget: EPR = async (info, data, send) => {
  const refid = $(data).attr().rid;
  const profile = await DB.FindOne<profile>(refid, { collection: "profile" });
  if (profile) {
    send.success();
  } else {
    send.deny();
  }
};

export const pcgetname: EPR = async (info, data, send) => {
  const refid = $(data).attr().rid;
  const profile = await DB.FindOne<profile>(refid, { collection: "profile" });
  send.object(
    K.ATTR({
      idstr: profile.iidxidstr,
      name: profile.name,
      pid: String(profile.pid),
    })
  );
};

export const pctakeover: EPR = async (info, data, send) => {
  const refid = $(data).attr().rid;
  const profile = await DB.FindOne<profile>(refid, { collection: "profile" });
  const version = GetVersion(info);
  let pc_data: object;

  if (version == 27) {
    pc_data = IIDX27_pc_data;
  }

  await DB.Upsert<profile>(
    refid,
    {
      collection: "profile",
    },
    {
      $set: {
        name: $(data).attr().name,
        pid: parseInt($(data).attr().pid),
        iidxid: profile.iidxid,
        iidxidstr: profile.iidxidstr,
        refid: refid,
      },
    }
  );
  await DB.Upsert<pc_data>(
    refid,
    {
      collection: "pc_data",
      version: version,
    },
    {
      $set: pc_data,
    }
  );
  send.object(
    K.ATTR({
      id: String(profile.iidxid),
    })
  );
};

export const pcreg: EPR = async (info, data, send) => {
  const id = _.random(10000000, 99999999);
  const id_str = IDToCode(id);
  const refid = $(data).attr().cid.split('|')[0];
  const version = GetVersion(info);
  let pc_data: object;

  if (version == 27) {
    pc_data = IIDX27_pc_data;
  }

  await DB.Upsert<profile>(
    refid,
    {
      collection: "profile",
    },
    {
      $set: {
        name: $(data).attr().name,
        pid: parseInt($(data).attr().pid),
        iidxid: id,
        iidxidstr: id_str,
        refid: refid,
      },
    }
  );
  await DB.Upsert<pc_data>(
    refid,
    {
      collection: "pc_data",
      version: version,
    },
    {
      $set: pc_data,
    }
  );

  send.object(
    K.ATTR({
      id: id,
      id_str: id_str,
      // status: "0",
    })
  );
};

export const pcget: EPR = async (info, data, send) => {
  const refid = $(data).attr().rid;
  const version = GetVersion(info);
  const pc_data = await DB.FindOne<pc_data>(refid, {
    collection: "pc_data",
    version: version,
  });
  if (_.isNil(pc_data)) {
    send.deny();
  } else {
    const profile = await DB.FindOne<profile>(refid, { collection: "profile" });
    const shop_data = await DB.FindOne<shop_data>({
      collection: "shop_data",
    });
    const dArray = (
      await DB.Find<grade>(refid, {
        collection: "grade",
        version: version,
      })
    ).map((r) => r.dArray);
    dArray.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const settings: settings = {
      frame: frame_list.indexOf(U.GetConfig("frame")),
      menu_music: menumusic_list.indexOf(U.GetConfig("menu_music")),
      note_burst: noteburst_list.indexOf(U.GetConfig("note_burst")),
      turntable: turntable_list.indexOf(U.GetConfig("turntable")),
      lane_cover: lanecover_list.indexOf(U.GetConfig("lane_cover")),
      pacemaker_cover: lanecover_list.indexOf(U.GetConfig("pacemaker_cover")),
      note_skin: notes_list.indexOf(U.GetConfig("note_skin")),
      judge_font: judge_list.indexOf(U.GetConfig("judge_font")),
      note_beam: keybeam_list.indexOf(U.GetConfig("note_beam")),
      full_combo_splash: fullcombo_list.indexOf(
        U.GetConfig("full_combo_splash")
      ),
      score_folders: Boolean(U.GetConfig("score_folders")),
      clear_folders: Boolean(U.GetConfig("clear_folders")),
      difficulty_folders: Boolean(U.GetConfig("difficulty_folders")),
      alphabet_folders: Boolean(U.GetConfig("alphabet_folders")),
      hide_playcount: Boolean(U.GetConfig("hide_playcount")),
      disable_graphcutin: Boolean(U.GetConfig("disable_graphcutin")),
      classic_hispeed: Boolean(U.GetConfig("classic_hispeed")),
      hide_iidxid: Boolean(U.GetConfig("hide_iidxid")),
      disable_musicpreview: Number(U.GetConfig("disable_musicpreview")),
      vefx_lock: Number(U.GetConfig("vefx_lock")),
      effect: effect_list.indexOf(U.GetConfig("effect")),
      bomb_size: bombsize_list.indexOf(U.GetConfig("bomb_size")),
      disable_hcn_color: Number(U.GetConfig("disable_hcn_color")),
      first_note_preview: first_note_preview_list.indexOf(
        U.GetConfig("first_note_preview")
      ),
      qpro_head: U.GetConfig("qpro_head"),
      qpro_hair: U.GetConfig("qpro_hair"),
      qpro_hand: U.GetConfig("qpro_hand"),
      qpro_face: U.GetConfig("qpro_face"),
      qpro_body: U.GetConfig("qpro_body"),
    };

    const appendsetting = AppendSettingConverter(
      settings.score_folders,
      settings.clear_folders,
      settings.difficulty_folders,
      settings.alphabet_folders,
      settings.hide_playcount,
      settings.disable_graphcutin,
      settings.classic_hispeed,
      settings.hide_iidxid
    );

    if (version == 27) {
      send.pugFile("pug/27get.pug", {
        settings,
        profile,
        appendsetting,
        pc_data,
        shop_data,
        dArray,
      });
    }
  }
};

export const pcsave: EPR = async (info, data, send) => {
  const refid = $(data).attr().cid.split('|')[0];
  const cltype = parseInt($(data).attr().cltype);
  const version = GetVersion(info);
  const pc_data = await DB.FindOne<pc_data>(refid, {
    collection: "pc_data",
    version: version,
  });
  let spnum = pc_data.spnum,
    dpnum = pc_data.dpnum,
    sprank = pc_data.sprank,
    sppoint = pc_data.sppoint,
    dprank = pc_data.dprank,
    dppoint = pc_data.dppoint,
    spradar = pc_data.spradar,
    dpradar = pc_data.dpradar,
    dp_clear_mission_clear = pc_data.dp_clear_mission_clear,
    dp_clear_mission_level = pc_data.dp_clear_mission_level,
    dp_dj_mission_clear = pc_data.dp_dj_mission_clear,
    dp_dj_mission_level = pc_data.dp_dj_mission_level,
    dp_level = pc_data.dp_level,
    dp_mission_point = pc_data.dp_mission_point,
    dp_mplay = pc_data.dp_mplay,
    enemy_damage = pc_data.enemy_damage,
    progress = pc_data.progress,
    sp_clear_mission_clear = pc_data.sp_clear_mission_clear,
    sp_clear_mission_level = pc_data.sp_clear_mission_level,
    sp_dj_mission_clear = pc_data.sp_dj_mission_clear,
    sp_dj_mission_level = pc_data.sp_dj_mission_level,
    sp_level = pc_data.sp_level,
    sp_mission_point = pc_data.sp_mission_point,
    sp_mplay = pc_data.sp_mplay,
    tips_read_list = pc_data.tips_read_list;

  let d_liflen = 0,
    s_liflen = 0,
    ngrade = 0;
  if (cltype == 0) {
    spnum = pc_data.spnum + 1;
    dpnum = pc_data.dpnum;
  }
  if (cltype == 1) {
    spnum = pc_data.spnum + 1;
    //dpnumって何
    dpnum = pc_data.dpnum + 1;
  }
  //liflenが存在したとき
  if ($(data).attr().d_lift) {
    d_liflen = parseInt($(data).attr().d_lift);
  }
  if ($(data).attr().s_lift) {
    s_liflen = parseInt($(data).attr().s_lift);
  }

  if (!_.isNil($(data).attr("step").dp_clear_mission_clear)) {
    dp_clear_mission_clear = parseInt(
      $(data).attr("step").dp_clear_mission_clear
    );
    dp_clear_mission_level = parseInt(
      $(data).attr("step").dp_clear_mission_level
    );
    dp_dj_mission_clear = parseInt($(data).attr("step").dp_dj_mission_clear);
    dp_dj_mission_level = parseInt($(data).attr("step").dp_dj_mission_level);
    dp_level = parseInt($(data).attr("step").dp_level);
    dp_mission_point = parseInt($(data).attr("step").dp_mission_point);
    dp_mplay = parseInt($(data).attr("step").dp_mplay);
    enemy_damage = parseInt($(data).attr("step").enemy_damage);
    progress = parseInt($(data).attr("step").progress);
    sp_clear_mission_clear = parseInt(
      $(data).attr("step").sp_clear_mission_clear
    );
    sp_clear_mission_level = parseInt(
      $(data).attr("step").sp_clear_mission_level
    );
    sp_dj_mission_clear = parseInt($(data).attr("step").sp_dj_mission_clear);
    sp_dj_mission_level = parseInt($(data).attr("step").sp_dj_mission_level);
    sp_level = parseInt($(data).attr("step").sp_level);
    sp_mission_point = parseInt($(data).attr("step").sp_mission_point);
    sp_mplay = parseInt($(data).attr("step").sp_mplay);
    tips_read_list = parseInt($(data).attr("step").tips_read_list);
  }

  if ($(data).attr("dj_rank.1").style == "1") {
    sprank = $(data).element("dj_rank").numbers("rank");
    sppoint = $(data).element("dj_rank").numbers("point");
    dprank = $(data).element("dj_rank.1").numbers("rank");
    dppoint = $(data).element("dj_rank.1").numbers("point");
  } else if ($(data).attr("dj_rank").style == "0") {
    sprank = $(data).element("dj_rank").numbers("rank");
    sppoint = $(data).element("dj_rank").numbers("point");
    dprank = pc_data.dprank;
    dppoint = pc_data.dppoint;
  } else if ($(data).attr("dj_rank").style == "1") {
    sprank = pc_data.sprank;
    sppoint = pc_data.sppoint;
    dprank = $(data).element("dj_rank").numbers("rank");
    dppoint = $(data).element("dj_rank").numbers("point");
  } else {
    sprank = pc_data.sprank;
    sppoint = pc_data.sppoint;
    dprank = pc_data.dprank;
    dppoint = pc_data.dppoint;
  }

  if ($(data).attr("notes_radar.1").style == "1") {
    spradar = $(data).element("notes_radar").numbers("radar_score");
    dpradar = $(data).element("notes_radar.1").numbers("radar_score");
  } else if ($(data).attr("notes_radar").style == "0") {
    spradar = $(data).element("notes_radar").numbers("radar_score");
    dpradar = pc_data.dpradar;
  } else if ($(data).attr("notes_radar").style == "1") {
    spradar = pc_data.spradar;
    dpradar = $(data).element("notes_radar").numbers("radar_score");
  } else {
    spradar = pc_data.spradar;
    dpradar = pc_data.dpradar;
  }
  if (version == 27) {
    await DB.Upsert<pc_data>(
      refid,
      {
        collection: "pc_data",
        version: version,
      },
      {
        $set: {
          deller:
            pc_data.deller + parseInt($(data).element("deller").attr().deller),

          trophy: $(data)
            .element("achievements")
            .bigints("trophy")
            .slice(0, 10)
            .map(String),

          sprank: sprank,
          sppoint: sppoint,
          dprank: dprank,
          dppoint: dppoint,

          spradar: spradar,
          dpradar: dpradar,

          dp_clear_mission_clear: dp_clear_mission_clear,
          dp_clear_mission_level: dp_clear_mission_level,
          dp_dj_mission_clear: dp_dj_mission_clear,
          dp_dj_mission_level: dp_dj_mission_level,
          dp_level: dp_level,
          dp_mission_point: dp_mission_point,
          dp_mplay: dp_mplay,
          enemy_damage: enemy_damage,
          progress: progress,
          sp_clear_mission_clear: sp_clear_mission_clear,
          sp_clear_mission_level: sp_clear_mission_level,
          sp_dj_mission_clear: sp_dj_mission_clear,
          sp_dj_mission_level: sp_dj_mission_level,
          sp_level: sp_level,
          sp_mission_point: sp_mission_point,
          sp_mplay: sp_mplay,
          tips_read_list: tips_read_list,

          dpnum: dpnum,
          d_auto_scrach: parseInt($(data).attr().d_auto_scrach),
          d_camera_layout: parseInt($(data).attr().d_camera_layout),
          d_disp_judge: parseInt($(data).attr().d_disp_judge),
          d_gauge_disp: parseInt($(data).attr().d_gauge_disp),
          d_ghost_score: parseInt($(data).attr().d_ghost_score),
          d_gno: parseInt($(data).attr().d_gno),
          d_graph_score: parseInt($(data).attr().d_graph_score),
          d_gtype: parseInt($(data).attr().d_gtype),
          d_hispeed: parseFloat($(data).attr().d_hispeed),
          d_judge: parseInt($(data).attr().d_judge),
          d_judgeAdj: parseInt($(data).attr().d_judgeAdj),
          d_lane_brignt: parseInt($(data).attr().d_lane_brignt),
          d_liflen: d_liflen,
          d_notes: parseFloat($(data).attr().d_notes),
          d_opstyle: parseInt($(data).attr().d_opstyle),
          d_pace: parseInt($(data).attr().d_pace),
          d_sdlen: parseInt($(data).attr().d_sdlen),
          d_sdtype: parseInt($(data).attr().d_sdtype),
          d_sorttype: parseInt($(data).attr().d_sorttype),
          d_timing: parseInt($(data).attr().d_timing),
          d_tsujigiri_disp: parseInt($(data).attr().d_tsujigiri_disp),
          dach: parseInt($(data).attr().d_achi),
          dp_opt: $(data).attr().dp_opt,
          dp_opt2: $(data).attr().dp_opt2,
          d_sub_gno: parseInt($(data).attr().d_sub_gno),

          gpos: parseInt($(data).attr().gpos),
          mode: parseInt($(data).attr().mode),
          pmode: parseInt($(data).attr().pmode),
          rtype: parseInt($(data).attr().rtype),

          spnum: spnum,
          s_auto_scrach: parseInt($(data).attr().s_auto_scrach),
          s_camera_layout: parseInt($(data).attr().s_camera_layout),
          s_disp_judge: parseInt($(data).attr().s_disp_judge),
          s_gauge_disp: parseInt($(data).attr().s_gauge_disp),
          s_ghost_score: parseInt($(data).attr().s_ghost_score),
          s_gno: parseInt($(data).attr().s_gno),
          s_graph_score: parseInt($(data).attr().s_graph_score),
          s_gtype: parseInt($(data).attr().s_gtype),
          s_hispeed: parseFloat($(data).attr().s_hispeed),
          s_judge: parseInt($(data).attr().s_judge),
          s_judgeAdj: parseInt($(data).attr().s_judgeAdj),
          s_lane_brignt: parseInt($(data).attr().s_lane_brignt),
          s_liflen: s_liflen,
          s_notes: parseFloat($(data).attr().s_notes),
          s_opstyle: parseInt($(data).attr().s_opstyle),
          s_pace: parseInt($(data).attr().s_pace),
          s_sdlen: parseInt($(data).attr().s_sdlen),
          s_sdtype: parseInt($(data).attr().s_sdtype),
          s_sorttype: parseInt($(data).attr().s_sorttype),
          s_timing: parseInt($(data).attr().s_timing),
          s_tsujigiri_disp: parseInt($(data).attr().s_tsujigiri_disp),
          sach: parseInt($(data).attr().s_achi),
          sp_opt: $(data).attr().sp_opt,
          s_sub_gno: parseInt($(data).attr().s_sub_gno),
        },
      }
    );
  }

  send.success();
};
