export interface score {
  collection: "score";

  music_id: number;

  spmArray: number[];
  dpmArray: number[];
}

export interface score_detail {
  collection: "score_detail";

  music_id: number;
  clid: number;

  score: number;
  clflg: number;
  miss: number;

  time: number;
}
