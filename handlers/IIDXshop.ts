import { shop_data } from "../models/shop_data";
export const shopgetname: EPR = async (info, data, send) => {
  // バージョン
  console.debug(`Version:${info.module.substr(0, 6)}`);
  const shop_data = await DB.FindOne<shop_data>({
    collection: "shop_data",
  });
  const shop_data_old = await DB.FindOne<shop_data>(null, {
    collection: "shop_data",
  });
  if(shop_data_old){
    await DB.Remove<shop_data>(null, {
      collection: "shop_data",
    });
  }
  if (_.isNil(shop_data)) {
    await DB.Insert<shop_data>({
      collection: "shop_data",

      shop_name: "Ａｓｐｈｙｘｉａ",
    });
    send.object(
      K.ATTR({
        cls_opt: "0",
        hr: "0",
        mi: "0",
        opname: "Ａｓｐｈｙｘｉａ",
        pid: "57",
        // status: "0",
      })
    );
  } else {
    send.object(
      K.ATTR({
        cls_opt: "0",
        hr: "0",
        mi: "0",
        opname: shop_data.shop_name,
        pid: "57",
        // status: "0",
      })
    );
  }
};

export const shopgetconvention: EPR = async (info, data, send) => {
  send.object(
    K.ATTR(
      {
        end_time: "0",
        music_0: "23051",
        music_1: "24010",
        music_2: "12004",
        music_3: "26007",
        start_time: "0",
        // status: "0",
      },
      {
        valid: K.ITEM("bool", 0),
      }
    )
  );
};

export const shopsavename: EPR = async (info, data, send) => {
  await DB.Upsert<shop_data>(
    {
      collection: "shop_data",
    },
    {
      $set: {
        shop_name: $(data).attr().opname,
      },
    }
  );
  send.success();
};
