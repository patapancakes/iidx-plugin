import { grade } from "../models/grade";
import { GetVersion, IIDXidTorefid } from "../util";
import { pc_data } from "../models/pc_data";

export const graderaised: EPR = async (info, data, send) => {
  const iidxid = parseInt($(data).attr().iidxid);
  const refid = await IIDXidTorefid(iidxid);
  const version = GetVersion(info);
  const style = parseInt($(data).attr().gtype);
  const gid = parseInt($(data).attr().gid);
  const cstage = parseInt($(data).attr().cstage);
  const achi = parseInt($(data).attr().achi);
  const grade = await DB.FindOne<grade>(refid, {
    collection: "grade",
    version: version,
    style: style,
    grade: gid,
  });
  const pc_data = await DB.FindOne<pc_data>(refid, {
    collection: "pc_data",
    version: version,
  });
  if (grade) {
    if (cstage <= grade.dArray[2]) {
      let archmax = Math.max(achi, grade.dArray[3]);
      let cstagemax = Math.max(cstage, grade.dArray[2]);
      await DB.Upsert<grade>(
        refid,
        {
          collection: "grade",
          version: version,
          style: style,
          grade: gid,
        },
        {
          $set: {
            version: version,
            style: style,
            grade: gid,
            dArray: [style, gid, cstagemax, archmax],
          },
        }
      );
    }
  } else {
    await DB.Upsert<grade>(
      refid,
      {
        collection: "grade",
        version: version,
        style: style,
        grade: gid,
      },
      {
        $set: {
          version: version,
          style: style,
          grade: gid,
          dArray: [style, gid, cstage, achi],
        },
      }
    );
  }
  if (cstage == 4 && style == 0 && pc_data.sgid < gid) {
    await DB.Upsert<pc_data>(
      refid,
      {
        collection: "pc_data",
        version: version,
      },
      {
        $set: {
          sgid: gid,
        },
      }
    );
  } else if (cstage == 4 && style == 1 && pc_data.dgid < gid) {
    await DB.Upsert<pc_data>(
      refid,
      {
        collection: "pc_data",
        version: version,
      },
      {
        $set: {
          dgid: gid,
        },
      }
    );
  }
  send.object(K.ATTR({ pnum: "1337" }));
};
