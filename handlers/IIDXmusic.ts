import { score, score_detail } from "../models/score";
import { profile } from "../models/profile";
import { shop_data } from "../models/shop_data";
import {
  base64decode,
  ClidToRank,
  GetVersion,
  IIDXidTorefid,
  DateToName,
  refidToName,
} from "../util";
import { pc_data } from "../models/pc_data";
import { ShopRanking_list } from "../data/settingslist";

export const musicreg: EPR = async (info, data, send) => {
  const iidxid = parseInt($(data).attr().iidxid);
  const version = GetVersion(info);
  const refid = await IIDXidTorefid(iidxid);
  const profile = await DB.FindOne<profile>(refid, {
    collection: "profile",
  });
  const shop_data = await DB.FindOne<shop_data>({
    collection: "shop_data",
  });
  const pc_data = await DB.FindOne<pc_data>(refid, {
    collection: "pc_data",
    version: version,
  });
  const qpro = {
    head: U.GetConfig("qpro_head"),
    hair: U.GetConfig("qpro_hair"),
    hand: U.GetConfig("qpro_hand"),
    face: U.GetConfig("qpro_face"),
    body: U.GetConfig("qpro_body"),
  };

  //譜面難易度(0がSPビギナー 4がSPレジェンダリア 5がDPビギナー(該当曲無し) 9がDPレジェンダリア)
  const clid = parseInt($(data).attr().clid);
  //musicid
  const music_id = parseInt($(data).element("music_play_log").attr().music_id);
  //SPが0 DPが1
  const style = parseInt($(data).element("music_play_log").attr().play_style);
  //譜面難易度(0がビギナー 4がレジェンダリア)
  const rank = parseInt($(data).element("music_play_log").attr().note_id);
  //クリア(0:noplay 1:failed 2:assisted 3:easy 4:normal 5:hard 6:exhard 7:fc)
  const clear = parseInt($(data).element("music_play_log").attr().clear_flg);
  //exscore
  const exscore = parseInt($(data).element("music_play_log").attr().ex_score);
  //ミスカウント
  const miss = parseInt($(data).element("music_play_log").attr().miss_num);
  //途中落ちかどうか(途中落ち:0 完走:1)
  const is_sudden_death = !$(data)
    .element("music_play_log")
    .bool("is_sudden_death");
  //ゴースト(base64)
  const ghost = $(data)
    .element("music_play_log")
    .buffer("ghost")
    .toString("base64");

  let mArray = [-1, music_id, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, -1, -1, -1, -1, -1];
  let dbflg = 0;
  let update = 1;

  const music_data: score | null = await DB.FindOne<score>(refid, {
    collection: "score",
    music_id: music_id,
  });

  const score_temp: score_detail | null = await DB.FindOne<score_detail>(
    refid,
    {
      collection: "score_detail",
      music_id: music_id,

      clid: clid,
    }
  );

  //mArrayがDB内に見つかったら代入

  if (music_data) {
    if (style == 0 && music_data.spmArray) {
      mArray = music_data.spmArray;
      dbflg = 1;
      if (
        _.isNil(score_temp) &&
        (music_data.spmArray[rank + 2] != 0 ||
          music_data.spmArray[rank + 7] != 0)
      ) {
        await DB.Insert<score_detail>(refid, {
          collection: "score_detail",

          music_id: music_id,
          clid: clid,

          score: music_data.spmArray[rank + 7],
          clflg: music_data.spmArray[rank + 2],
          miss: music_data.spmArray[rank + 12],
          time: Date.now() - 86400000,
        });
      }
    } else if (style == 1 && music_data.dpmArray) {
      mArray = music_data.dpmArray;
      dbflg = 1;
      if (
        _.isNil(score_temp) &&
        (music_data.dpmArray[rank + 2] != 0 ||
          music_data.spmArray[rank + 7] != 0)
      ) {
        await DB.Insert<score_detail>(refid, {
          collection: "score_detail",

          music_id: music_id,
          clid: clid,

          score: music_data.dpmArray[rank + 7],
          clflg: music_data.dpmArray[rank + 2],
          miss: music_data.dpmArray[rank + 12],
          time: Date.now() - 86400000,
        });
      }
    }
  }

  //クリアランプ
  mArray[rank + 2] = Math.max(clear, mArray[rank + 2]);
  // 完走の場合ミスカウントセーブ
  if (is_sudden_death) {
    // -1の場合大小比較出来ない為
    if (mArray[rank + 12] == -1) {
      mArray[rank + 12] = miss;
    } else {
      mArray[rank + 12] = Math.min(mArray[rank + 12], miss);
    }
  }
  if (style == 0) {
    if (mArray[rank + 7] < exscore || dbflg == 0) {
      //スコア
      mArray[rank + 7] = Math.max(exscore, mArray[rank + 7]);
      await DB.Upsert<score>(
        refid,
        {
          collection: "score",
          music_id: music_id,
        },
        {
          $set: {
            music_id: music_id,
            spmArray: mArray,
            [clid]: ghost,
          },
        }
      );
    } else {
      mArray[rank + 7] = Math.max(exscore, mArray[rank + 7]);
      update = 0;
      await DB.Upsert<score>(
        refid,
        {
          collection: "score",
          music_id: music_id,
        },
        {
          $set: {
            music_id: music_id,
            spmArray: mArray,
          },
        }
      );
    }
  } else if (style == 1) {
    if (mArray[rank + 7] < exscore || dbflg == 0) {
      mArray[rank + 7] = Math.max(exscore, mArray[rank + 7]);
      await DB.Upsert<score>(
        refid,
        {
          collection: "score",
          music_id: music_id,
        },
        {
          $set: {
            music_id: music_id,
            dpmArray: mArray,
            [clid]: ghost,
          },
        }
      );
    } else {
      mArray[rank + 7] = Math.max(exscore, mArray[rank + 7]);
      update = 0;
      await DB.Upsert<score>(
        refid,
        {
          collection: "score",
          music_id: music_id,
        },
        {
          $set: {
            music_id: music_id,
            dpmArray: mArray,
          },
        }
      );
    }
  }

  //スコア詳細
  await DB.Insert<score_detail>(refid, {
    collection: "score_detail",

    music_id: music_id,
    clid: clid,

    score: exscore,
    clflg: clear,
    miss: miss,

    time: Date.now(),
  });

  const result = {
    shopdata: K.ATTR({ rank: "1" }),
    LDJ: K.ATTR({
      clid: "1",
      crate: "1000",
      frate: "0",
      mid: String(music_id),
    }),
    ranklist: {
      data: [],
    },
  };
  //スコア詳細ロード[スコア,クリアランプ]
  const scores = (
    await DB.Find<score_detail>(refid, {
      collection: "score_detail",
      music_id: music_id,

      clid: clid,
    })
  ).map((r) => [r.score, r.clflg, r.time]);

  scores.sort((a, b) => b[0] - a[0] || a[1] - b[1]);

  //スコアが5つの時削除(仮)
  if (scores.length >= 5) {
    const dscore = scores[4][0];
    const dclflg = scores[4][1];
    const dtime = scores[4][2];
    await DB.Remove<score_detail>(refid, {
      collection: "score_detail",

      music_id: music_id,
      clid: clid,

      score: dscore,
      clflg: dclflg,
      time: dtime,
    });
  }

  if (ShopRanking_list.indexOf(U.GetConfig("ShopRanking")) == 0) {
    //今プレイした順位を計算
    const currentrank = scores.findIndex(
      (item) => item[0] == exscore && item[1] == clear
    );

    const now = Date.now();

    scores.forEach((rankscore, index) => {
      if (index == currentrank) {
        result.ranklist.data.push(
          K.ATTR({
            body: qpro.body,
            clflg: String(rankscore[1]),
            dgrade: String(pc_data.dgid),
            face: qpro.face,
            hair: qpro.hair,
            hand: qpro.hand,
            head: qpro.head,
            iidx_id: String(profile.iidxid),
            myFlg: "1",
            name: profile.name,
            opname: shop_data.shop_name,
            pid: String(profile.pid),
            rnum: String(index + 1),
            score: String(rankscore[0]),
            sgrade: String(pc_data.sgid),
            update: String(update),
          })
        );
      } else {
        result.ranklist.data.push(
          K.ATTR({
            body: qpro.body,
            clflg: String(rankscore[1]),
            dgrade: String(pc_data.dgid),
            face: qpro.face,
            hair: qpro.hair,
            hand: qpro.hand,
            head: qpro.head,
            iidx_id: String(profile.iidxid),
            myFlg: "0",
            name: DateToName(now, rankscore[2]),
            opname: shop_data.shop_name,
            pid: String(profile.pid),
            rnum: String(index + 1),
            score: String(rankscore[0]),
            sgrade: String(pc_data.sgid),
            update: "0",
          })
        );
      }
    });
  } else if (ShopRanking_list.indexOf(U.GetConfig("ShopRanking")) == 1) {
    let pscores: any[][];
    if (style == 0) {
      pscores = (
        await DB.Find(null, {
          collection: "score",
          music_id: music_id,
          spmArray: { $exists: true },
        })
      ).map((r) => [r.spmArray[rank + 7], r.spmArray[rank + 2], r.__refid]);
    } else if (style == 1) {
      pscores = (
        await DB.Find(null, {
          collection: "score",
          music_id: music_id,
          dpmArray: { $exists: true },
        })
      ).map((r) => [r.dpmArray[rank + 7], r.dpmArray[rank + 2], r.__refid]);
    }
    pscores.sort((a, b) => b[0] - a[0]);
    const currentrank = pscores.findIndex((item) => item[2] == refid);

    pscores = await Promise.all(
      pscores.map(async (r) => [r[0], r[1], await refidToName(r[2])])
    );

    pscores.forEach((rankscore, index) => {
      if (index == currentrank) {
        result.ranklist.data.push(
          K.ATTR({
            body: qpro.body,
            clflg: String(rankscore[1]),
            dgrade: String(pc_data.dgid),
            face: qpro.face,
            hair: qpro.hair,
            hand: qpro.hand,
            head: qpro.head,
            iidx_id: String(profile.iidxid),
            myFlg: "1",
            name: profile.name,
            opname: shop_data.shop_name,
            pid: String(profile.pid),
            rnum: String(index + 1),
            score: String(rankscore[0]),
            sgrade: String(pc_data.sgid),
            update: String(update),
          })
        );
      } else if (rankscore[0] != 0 || rankscore[1] != 0) {
        result.ranklist.data.push(
          K.ATTR({
            body: qpro.body,
            clflg: String(rankscore[1]),
            dgrade: String(pc_data.dgid),
            face: qpro.face,
            hair: qpro.hair,
            hand: qpro.hand,
            head: qpro.head,
            iidx_id: String(profile.iidxid),
            myFlg: "0",
            name: rankscore[2],
            opname: shop_data.shop_name,
            pid: String(profile.pid),
            rnum: String(index + 1),
            score: String(rankscore[0]),
            sgrade: String(pc_data.sgid),
            update: "0",
          })
        );
      }
    });
  }

  send.object(result);
};

export const musicgetrank: EPR = async (info, data, send) => {
  const cltype = $(data).attr().cltype;
  const iidxid = parseInt($(data).attr().iidxid);
  const refid = await IIDXidTorefid(iidxid);

  const spmArray: any = (
    await DB.Find(refid, {
      collection: "score",
      spmArray: { $exists: true },
    })
  ).map((r) => r.spmArray);
  spmArray.sort((a: number, b: number) => a[1] - b[1]);

  const dpmArray: any = (
    await DB.Find(refid, {
      collection: "score",
      dpmArray: { $exists: true },
    })
  ).map((r) => r.dpmArray);
  dpmArray.sort((a: number, b: number) => a[1] - b[1]);

  const result: any = {
    style: K.ATTR({ type: cltype }),
    m: [],
    best: K.ARRAY(
      "u16",
      [
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
        65535,
      ],
      { rno: "-1" }
    ),
  };
  if (cltype == "0") {
    spmArray.forEach((m: number[]) => {
      result.m.push(K.ARRAY("s16", m));
    });
  } else if (cltype == "1") {
    dpmArray.forEach((m: number[]) => {
      result.m.push(K.ARRAY("s16", m));
    });
  }
  send.object(result);
};

export const musicappoint: EPR = async (info, data, send) => {
  const iidxid = parseInt($(data).attr().iidxid);
  const refid = await IIDXidTorefid(iidxid);
  const music_id = parseInt($(data).attr().mid);
  const clid = parseInt($(data).attr().clid);
  const rank = ClidToRank(clid).rank;
  const style = ClidToRank(clid).style;
  let ghost: string,
    score = 0;
  const music_data_sp = await DB.FindOne(refid, {
    collection: "score",
    music_id: music_id,
    spmArray: { $exists: true },
    [clid]: { $exists: true },
  });
  const music_data_dp = await DB.FindOne(refid, {
    collection: "score",
    music_id: music_id,
    dpmArray: { $exists: true },
    [clid]: { $exists: true },
  });

  if (style == 0 && music_data_sp) {
    score = music_data_sp.spmArray[rank + 7];
    ghost = base64decode(music_data_sp[clid]);
    send.object({ mydata: K.ITEM("bin", ghost, { score: String(score) }) });
  } else if (style == 1 && music_data_dp) {
    score = music_data_dp.dpmArray[rank + 7];
    ghost = base64decode(music_data_dp[clid]);
    send.object({ mydata: K.ITEM("bin", ghost, { score: String(score) }) });
  } else {
    send.success();
  }
};

export const musiccrate: EPR = async (info, data, send) => {
  const version = info.module;
  send.pugFile("pug/crate.pug", { version });
};
