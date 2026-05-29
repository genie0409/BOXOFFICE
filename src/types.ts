export interface Movie {
  rnum: string;
  rank: string;
  rankInten: string;
  rankOldAndNew: "OLD" | "NEW";
  movieCd: string;
  movieNm: string;
  openDt: string;
  salesAmt: string;
  salesShare: string;
  salesInten: string;
  salesChange: string;
  salesAcc: string;
  audiCnt: string;
  audiInten: string;
  audiChange: string;
  audiAcc: string;
  scrnCnt: string;
  showCnt: string;
}

export interface NationalItem {
  nationNm: string;
}

export interface GenreItem {
  genreNm: string;
}

export interface DirectorItem {
  peopleNm: string;
  peopleNmEn: string;
}

export interface ActorItem {
  peopleNm: string;
  peopleNmEn: string;
  cast: string;
  castEn: string;
}

export interface ShowTypeItem {
  showTypeGrpNm: string;
  showTypeNm: string;
}

export interface CompanyItem {
  companyCd: string;
  companyNm: string;
  companyNmEn: string;
  companyPartNm: string;
}

export interface AuditItem {
  auditNo: string;
  watchGradeNm: string;
}

export interface StaffItem {
  peopleNm: string;
  peopleNmEn: string;
  staffRoleNm: string;
}

export interface MovieInfo {
  movieCd: string;
  movieNm: string;
  movieNmEn: string;
  movieNmOg: string;
  showTm: string;
  prdtYear: string;
  openDt: string;
  typeNm: string;
  nations: NationalItem[];
  genres: GenreItem[];
  directors: DirectorItem[];
  actors: ActorItem[];
  showTypes: ShowTypeItem[];
  companys: CompanyItem[];
  audits: AuditItem[];
  staffs: StaffItem[];
}

export interface MovieInfoResult {
  movieInfoResult: {
    movieInfo: MovieInfo;
    source?: string;
  };
}

export interface BoxOfficeResult {
  boxOfficeResult: {
    boxofficeType: string;
    showRange: string;
    dailyBoxOfficeList: Movie[];
  };
}
