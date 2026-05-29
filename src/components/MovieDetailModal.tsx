import { useEffect, useState } from "react";
import { MovieInfo, MovieInfoResult } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { X, Film, Sparkles, LogOut, Clapperboard, Layers, ShieldAlert, Award, Compass, Search, Video } from "lucide-react";

interface MovieDetailModalProps {
  movieCd: string | null;
  onClose: () => void;
}

export default function MovieDetailModal({ movieCd, onClose }: MovieDetailModalProps) {
  const [movieInfo, setMovieInfo] = useState<MovieInfo | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [keyword1, setKeyword1] = useState<string>("");
  const [keyword2, setKeyword2] = useState<string>("");
  const [keyword3, setKeyword3] = useState<string>("");
  const [reviewText, setReviewText] = useState<string>("");
  const [generating, setGenerating] = useState<boolean>(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieCd) {
      setMovieInfo(null);
      return;
    }

    const fetchMovieDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/movie?movieCd=${movieCd}`);
        if (!response.ok) {
          throw new Error("영화 정보를 불러오는데 실패했습니다.");
        }
        const data: MovieInfoResult = await response.json();
        const info = data.movieInfoResult?.movieInfo;
        if (!info) {
          throw new Error("영화 보관서에 해당 상세 정보가 없습니다.");
        }
        setMovieInfo(info);
      } catch (err: any) {
        console.error("Fetch detail error:", err);
        setError(err.message || "오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetail();

    // Restores review and keywords from LocalStorage for the current movie code
    const savedReview = localStorage.getItem(`movie_review_${movieCd}`) || "";
    setReviewText(savedReview);
    const savedKeywords = localStorage.getItem(`movie_keywords_${movieCd}`);
    if (savedKeywords) {
      try {
        const [k1, k2, k3] = JSON.parse(savedKeywords);
        setKeyword1(k1 || "");
        setKeyword2(k2 || "");
        setKeyword3(k3 || "");
      } catch (e) {
        setKeyword1("");
        setKeyword2("");
        setKeyword3("");
      }
    } else {
      setKeyword1("");
      setKeyword2("");
      setKeyword3("");
    }
    setGeneratorError(null);
  }, [movieCd]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (movieCd) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [movieCd]);

  const handleGenerateReview = async () => {
    if (!movieInfo) return;
    const k1 = keyword1.trim();
    const k2 = keyword2.trim();
    const k3 = keyword3.trim();

    if (!k1 || !k2 || !k3) {
      setGeneratorError("3가지 키워드를 모두 입력해 주세요. (예: 영상미, 연출, 최고)");
      return;
    }

    setGenerating(true);
    setGeneratorError(null);

    try {
      const response = await fetch("/api/generate-review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          movieTitle: movieInfo.movieNm,
          keywords: [k1, k2, k3],
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "감상평 생성에 실패했습니다.");
      }

      const data = await response.json();
      setReviewText(data.review);
      
      // Persist in LocalStorage
      localStorage.setItem(`movie_review_${movieCd}`, data.review);
      localStorage.setItem(`movie_keywords_${movieCd}`, JSON.stringify([k1, k2, k3]));
    } catch (err: any) {
      console.error("Generate review error:", err);
      setGeneratorError(err.message || "감상평 생성 과정에서 외부 서버와 통신하지 못했거나 오류가 발생했습니다.");
    } finally {
      setGenerating(false);
    }
  };

  if (!movieCd) return null;

  const getWatchGradeColor = (gradeNm: string) => {
    if (gradeNm.includes("전체")) return "bg-green-500 text-white border-green-600";
    if (gradeNm.includes("12")) return "bg-indigo-500 text-white border-indigo-600";
    if (gradeNm.includes("15")) return "bg-amber-500 text-white border-amber-600";
    if (gradeNm.includes("18") || gradeNm.includes("청소년")) return "bg-rose-600 text-white border-rose-700";
    return "bg-gray-450 dark:bg-gray-700 text-white border-gray-600";
  };

  const getKoreanDateString = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return dateStr;
    const yyyy = dateStr.slice(0, 4);
    const mm = dateStr.slice(4, 6);
    const dd = dateStr.slice(6, 8);
    return `${yyyy}년 ${mm}월 ${dd}일`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay blur */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-950/75 backdrop-blur-md"
        />

        {/* Modal Window Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] shadow-2xl z-10 scrollbar-thin flex flex-col"
        >
          {/* Header Close button */}
          <button
            id="close-modal-button"
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors z-20 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Core Body Content */}
          <div className="p-6 md:p-8 flex-1">
            {loading ? (
              /* Loading Skeleton Dashboard */
              <div id="modal-skeleton" className="space-y-6 py-6 animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-850 rounded-sm" />
                  <div className="h-8 w-3/4 bg-slate-300 dark:bg-slate-800 rounded-md" />
                  <div className="h-5 w-48 bg-slate-200 dark:bg-slate-850 rounded-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                  <div className="space-y-3 col-span-1">
                    <div className="h-40 bg-slate-200 dark:bg-slate-850 rounded-2xl" />
                    <div className="h-10 bg-slate-300 dark:bg-slate-800 rounded-xl" />
                  </div>
                  <div className="space-y-4 col-span-2">
                    <div className="h-6 w-32 bg-slate-300 dark:bg-slate-800 rounded-sm" />
                    <div className="space-y-2">
                      <div className="h-5 w-full bg-slate-200 dark:bg-slate-850 rounded-sm" />
                      <div className="h-5 w-5/6 bg-slate-200 dark:bg-slate-850 rounded-sm" />
                      <div className="h-5 w-4/5 bg-slate-200 dark:bg-slate-850 rounded-sm" />
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              /* Error State */
              <div id="modal-error" className="py-12 text-center">
                <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">영화 정보를 불려올 수 없습니다</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error}</p>
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-850 cursor-pointer"
                >
                  창 닫기
                </button>
              </div>
            ) : movieInfo ? (
              /* Movie Info presentation */
              <div id="modal-movie-content" className="space-y-6">
                
                {/* Movie Titles & Basic Info */}
                <div className="space-y-2 border-b border-slate-150 dark:border-slate-800 pb-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {movieInfo.genres.map((g) => (
                      <span key={g.genreNm} className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400">
                        {g.genreNm}
                      </span>
                    ))}
                    <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      {movieInfo.typeNm}
                    </span>
                  </div>

                  <h2 className="font-display font-extrabold text-2xl md:text-3.5xl text-slate-900 dark:text-white leading-tight tracking-tight">
                    {movieInfo.movieNm}
                  </h2>
                  
                  {movieInfo.movieNmEn && (
                    <p className="text-sm md:text-base font-mono text-gray-450 dark:text-gray-500">
                      {movieInfo.movieNmEn} {movieInfo.movieNmOg ? `(${movieInfo.movieNmOg})` : ""}
                    </p>
                  )}
                </div>

                {/* Main Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  
                  {/* Left Column: Visual Specs card */}
                  <div className="md:col-span-4 space-y-4">
                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 space-y-4">
                      <div className="font-bold text-xs uppercase tracking-widest text-slate-400 border-b border-slate-200/50 dark:border-slate-700/50 pb-2">
                        영화 개요 (Overview)
                      </div>

                      {/* Film Duration */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Clapperboard className="w-4 h-4 text-slate-400" /> 상영 시간
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">
                          {movieInfo.showTm || "0"}분
                        </span>
                      </div>

                      {/* Production Year */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Layers className="w-4 h-4 text-slate-400" /> 제작 연도
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200 font-mono">
                          {movieInfo.prdtYear}년
                        </span>
                      </div>

                      {/* Open Date */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Compass className="w-4 h-4 text-slate-400" /> 개봉 일자
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {getKoreanDateString(movieInfo.openDt)}
                        </span>
                      </div>

                      {/* Nations list */}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
                          <Sparkles className="w-4 h-4 text-slate-400" /> 제작 국가
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {movieInfo.nations.map((n) => n.nationNm).join(", ") || "-"}
                        </span>
                      </div>

                      {/* Audience Audit - Watch Grade */}
                      {movieInfo.audits && movieInfo.audits.length > 0 && (
                        <div className="pt-2 border-t border-slate-200/40 dark:border-slate-700/45 space-y-2">
                          <span className="text-slate-450 text-[11px] font-semibold block uppercase">심의 등급</span>
                          <div className="flex flex-col gap-1.5">
                            {movieInfo.audits.map((a) => (
                              <span
                                key={a.auditNo}
                                className={`text-xs px-3 py-1.5 rounded-xl border text-center font-semibold tracking-tight ${getWatchGradeColor(a.watchGradeNm)}`}
                              >
                                {a.watchGradeNm}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Quick Link Actions */}
                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-450 dark:text-slate-550 uppercase tracking-widest pl-1">
                        더 많은 정보 & 포스터 찾기
                      </div>
                      
                      {/* Search Google */}
                      <a
                        href={`https://www.google.com/search?q=${encodeURIComponent(movieInfo.movieNm + " 영화 포스터 주거리")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-sky-500 dark:hover:text-sky-400 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Search className="w-4 h-4 text-sky-500" /> Google 영화 검색
                        </span>
                        <LogOut className="w-3.5 h-3.5 opacity-60" />
                      </a>

                      {/* Search Naver */}
                      <a
                        href={`https://search.naver.com/search.naver?query=${encodeURIComponent(movieInfo.movieNm + " 영화")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-green-500 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 text-emerald-505 font-extrabold flex items-center justify-center font-sans">N</span> 네이버 상세 정보
                        </span>
                        <LogOut className="w-3.5 h-3.5 opacity-60" />
                      </a>

                      {/* Trailers Youtube */}
                      <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movieInfo.movieNm + " 공식 예고편 메인 트레일러")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-rose-600" /> 공식 예고편 (YouTube)
                        </span>
                        <LogOut className="w-3.5 h-3.5 opacity-60" />
                      </a>
                    </div>
                  </div>

                  {/* Right Column: Cast & Crew details */}
                  <div className="md:col-span-8 space-y-6">
                    {/* Directors */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                        <Award className="w-4.5 h-4.5 text-sky-500" /> 감독 (Directors)
                      </h4>
                      {movieInfo.directors && movieInfo.directors.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {movieInfo.directors.map((dir, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800">
                              <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{dir.peopleNm}</div>
                              <div className="text-xs font-mono text-slate-400 dark:text-slate-500">{dir.peopleNmEn || "Director"}</div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400">등록된 감독 정보가 없습니다.</div>
                      )}
                    </div>

                    {/* Actors */}
                    <div>
                      <h4 className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-200 uppercase border-b border-slate-100 dark:border-slate-700 pb-2 mb-3">
                        <Film className="w-4.5 h-4.5 text-sky-500" /> 출연 배우 (Actors)
                      </h4>
                      {movieInfo.actors && movieInfo.actors.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {movieInfo.actors.map((actor, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 border border-slate-150 dark:border-slate-800 flex flex-col justify-between">
                              <div>
                                <div className="font-semibold text-xs sm:text-sm text-slate-905 dark:text-slate-150">{actor.peopleNm}</div>
                                <div className="text-[10px] font-mono text-slate-450 dark:text-slate-500 truncate" title={actor.peopleNmEn}>
                                  {actor.peopleNmEn || "N/A"}
                                </div>
                              </div>
                              {actor.cast && (
                                <div className="mt-2 pt-1 border-t border-slate-150 dark:border-slate-800/50 text-[11px] font-medium text-sky-650 dark:text-sky-400 italic">
                                  역: {actor.cast}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-slate-400">네트워크 아카이브에 등록된 출연 배우 정보가 없습니다.</div>
                      )}
                    </div>

                    {/* Movie staff context */}
                    {movieInfo.staffs && movieInfo.staffs.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mb-2 tracking-widest font-mono">
                          제작 참여 스태프
                        </h4>
                        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                          {movieInfo.staffs.map((st, idx) => (
                            <span key={idx} className="inline-flex items-center text-[10px] md:text-[11px] px-2 py-0.5 rounded-md border border-slate-150 dark:border-slate-805 bg-slate-55 dark:bg-slate-900 text-slate-600 dark:text-slate-400">
                              <span className="font-semibold mr-1">{st.staffRoleNm}:</span> {st.peopleNm}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Producing Companies */}
                    {movieInfo.companys && movieInfo.companys.length > 0 && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-gray-400 dark:text-gray-550 uppercase mb-2 tracking-widest">
                          제작 / 배급사
                        </h4>
                        <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
                          {movieInfo.companys.map((comp, idx) => (
                            <div key={idx} className="flex flex-wrap gap-2 items-center">
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500">
                                {comp.companyPartNm || "사사"}
                              </span>
                              <span className="font-medium text-gray-800 dark:text-gray-200">{comp.companyNm}</span>
                              {comp.companyNmEn && <span className="font-mono text-gray-450 dark:text-gray-500 text-[10px]">({comp.companyNmEn})</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* AI Review Generator Section */}
                <div id="ai-review-generator" className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
                  <div className="bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-purple-500/5 dark:from-sky-500/10 dark:via-indigo-500/10 dark:to-purple-500/10 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 space-y-5">
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-xl bg-sky-500/10 text-sky-650 dark:text-sky-400 mt-0.5">
                        <Sparkles className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-base md:text-lg">
                          🤖 AI 키워드 감상평 생성기
                        </h4>
                        <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
                          기억에 남은 포인트, 감정, 분위기 등 3가지 자유 키워드를 조합하여 유려한 한 문단의 인공지능 감상평을 작성해보세요.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono pl-1">
                          키워드 1
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          placeholder="예: 몰입도 넘치는"
                          value={keyword1}
                          onChange={(e) => setKeyword1(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none focus:border-sky-500 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono pl-1">
                          키워드 2
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          placeholder="예: 긴 여운의 결말"
                          value={keyword2}
                          onChange={(e) => setKeyword2(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none focus:border-sky-500 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase font-mono pl-1">
                          키워드 3
                        </label>
                        <input
                          type="text"
                          maxLength={15}
                          placeholder="예: 인생 명작"
                          value={keyword3}
                          onChange={(e) => setKeyword3(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none focus:border-sky-500 text-slate-850 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    {generatorError && (
                      <div className="p-3 text-xs font-semibold text-rose-500 bg-rose-500/10 rounded-xl border border-rose-550/25">
                        ❌ {generatorError}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        id="generate-review-btn"
                        disabled={generating}
                        onClick={handleGenerateReview}
                        className="px-5 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm cursor-pointer hover:scale-103 active:scale-97 transition-all flex items-center gap-2 shadow-md shadow-sky-500/10 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-sky-550 to-indigo-600"
                      >
                        {generating ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            AI 감상평 생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" /> 감상평 작성버튼
                          </>
                        )}
                      </button>
                    </div>

                    {/* Review text box */}
                    {reviewText && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800 space-y-3 relative shadow-inner"
                      >
                        <span className="absolute top-3 left-4 text-sky-500/15 dark:text-sky-400/10 text-4xl font-serif select-none">“</span>
                        <div className="pl-6 pr-2 text-slate-805 dark:text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
                          {reviewText}
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pl-6 pt-3 border-t border-slate-200/55 dark:border-slate-800/40 gap-3">
                          <span className="text-[10px] sm:text-xs text-slate-450 dark:text-slate-500 font-medium">
                            💡 이 감상평 정보는 브라우저 보관소에 안전하게 자동 저장되었습니다.
                          </span>
                          <div className="flex items-center gap-2 self-end">
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(reviewText);
                                alert("작성된 AI 감상평이 클립보드에 무사히 복사되었습니다.");
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-650 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                            >
                              텍스트 복제
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm("공들여 작성한 이 감상평을 삭제하시겠습니까?")) {
                                  localStorage.removeItem(`movie_review_${movieCd}`);
                                  localStorage.removeItem(`movie_keywords_${movieCd}`);
                                  setReviewText("");
                                  setKeyword1("");
                                  setKeyword2("");
                                  setKeyword3("");
                                }
                              }}
                              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-rose-100 dark:border-rose-950/20 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/10 cursor-pointer transition-colors"
                            >
                              삭제
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                  </div>
                </div>

              </div>
            ) : null}
          </div>

          {/* Modal Footer Area with Source indicator */}
          <div className="bg-gray-50 dark:bg-gray-950/80 border-t border-gray-100 dark:border-gray-850 px-6 py-4 flex items-center justify-between text-xs text-gray-400 dark:text-gray-550">
            <span>영화의 코드 번호: {movieCd}</span>
            <span>제공: 영화진흥위원회 통합전산망 KOBIS</span>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
