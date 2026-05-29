import { useState, useEffect } from "react";
import { Movie, BoxOfficeResult } from "./types";
import ThemeToggle from "./components/ThemeToggle";
import MovieCard from "./components/MovieCard";
import MovieDetailModal from "./components/MovieDetailModal";
import { motion } from "motion/react";
import {
  Film,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Loader2,
  Search,
  AlertCircle,
  Clapperboard,
  Users2,
  Sparkles,
  RefreshCw
} from "lucide-react";

export default function App() {
  // Calculate yesterday's date string dynamically as the absolute ceiling
  const getYesterdayString = (): string => {
    // Standard system date
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const maxSelectableDate = getYesterdayString();

  // State definitions
  const [selectedDate, setSelectedDate] = useState<string>(maxSelectableDate);
  const [movieList, setMovieList] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedMovieCd, setSelectedMovieCd] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(true);

  // Fetch standard Daily Box Office list based on target date
  useEffect(() => {
    const fetchBoxOffice = async () => {
      setLoading(true);
      setError(null);
      // Format 2026-05-28 -> 20260528
      const formattedDate = selectedDate.replace(/-/g, "");
      
      try {
        const response = await fetch(`/api/boxoffice?date=${formattedDate}`);
        if (!response.ok) {
          throw new Error("서버에서 정보를 정상적으로 응답받지 못했습니다.");
        }
        const data: BoxOfficeResult = await response.json();
        const list = data.boxOfficeResult?.dailyBoxOfficeList;
        
        if (list && Array.isArray(list)) {
          setMovieList(list);
        } else {
          setMovieList([]);
          setError("해당 날짜의 박스오피스 조회가 지원되지 않거나 데이터가 존재하지 않습니다.");
        }
      } catch (err: any) {
        console.error("Box office list fetch error:", err);
        setError("일일 박스오피스 데이터를 가져오는 도중 문제가 발생했습니다. 네트워크 연결을 확인하고 다시 시도해 주세요.");
      } finally {
        setLoading(false);
      }
    };

    fetchBoxOffice();
  }, [selectedDate]);

  // Handle previous day button click
  const handlePrevDay = () => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() - 1);
    
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  // Handle next day button click (guard till yesterday max limit!)
  const handleNextDay = () => {
    if (selectedDate >= maxSelectableDate) return;
    
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + 1);
    
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, "0");
    const dd = String(current.getDate()).padStart(2, "0");
    setSelectedDate(`${yyyy}-${mm}-${dd}`);
  };

  const getKoreanDateFullString = (dateStr: string) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long"
    });
  };

  // Search filter
  const filteredMovies = movieList.filter((movie) =>
    movie.movieNm.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute stats metrics
  const totalAudienceOfToday = movieList.reduce(
    (acc, m) => acc + (parseInt(m.audiCnt, 10) || 0),
    0
  );
  
  const top1Movie = movieList.find((m) => m.rank === "1");

  return (
    <div className="min-h-screen transition-colors duration-250 bg-slate-50 text-slate-905 dark:bg-[#0F172A] dark:text-slate-100 flex flex-col font-sans">
      
      {/* 🔴 Global Glowing Ambient Mesh Background for Dark Mode */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden opacity-30 dark:opacity-40 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute top-[-5%] right-[-5%] w-96 h-96 rounded-full bg-indigo-600/10 blur-3xl animate-pulse" />
      </div>

      {/* Primary Header Hero Area */}
      <header className="relative border-b border-slate-200/90 dark:border-slate-800 bg-white/60 dark:bg-[#0F172A]/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
              <Clapperboard className="w-5.5 h-5.5" />
            </div>
            <div>
              <h1 className="font-display font-black text-xl tracking-tight leading-none bg-gradient-to-r from-sky-400 via-sky-500 to-indigo-500 bg-clip-text text-transparent">
                일일 박스오피스 랭킹
              </h1>
              <p className="text-[10px] font-mono tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                Korean Box office list
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle onThemeChange={(theme) => setIsDark(theme === "dark")} />
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="relative flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 z-10 space-y-8">
        
        {/* Date Selector and Navigation Center */}
        <section className="p-6 rounded-3xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700/80 shadow-sm dark:shadow-none space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title description inside section */}
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500 mt-0.5">
                <CalendarRange className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-lg md:text-xl text-slate-900 dark:text-slate-100 leading-tight">
                  조회 날짜 선택
                </h2>
                <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
                  원하는 날짜를 선택하여 실시간 한국 영화의 흥행 실적을 확인하세요. (오늘 이전만 선택 가능)
                </p>
              </div>
            </div>

            {/* Date Picker Input and Day Changers */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Prev Day button */}
              <button
                id="prev-day-button"
                onClick={handlePrevDay}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm cursor-pointer outline-none focus:ring-1 focus:ring-sky-500 text-slate-500 dark:text-slate-400"
                title="이전 날짜로 이동"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Real Input Date Picker */}
              <div className="relative">
                <input
                  id="date-picker-input"
                  type="date"
                  value={selectedDate}
                  max={maxSelectableDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSelectedDate(val);
                  }}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-semibold font-mono text-sm tracking-tight shadow-sm cursor-pointer focus:ring-1 focus:ring-sky-500 focus:border-sky-500 focus:outline-none text-slate-850 dark:text-slate-100"
                />
              </div>

              {/* Next Day button */}
              <button
                id="next-day-button"
                onClick={handleNextDay}
                disabled={selectedDate >= maxSelectableDate}
                className={`p-2.5 rounded-xl border transition-colors shadow-sm outline-none focus:ring-1 focus:ring-sky-500 ${
                  selectedDate >= maxSelectableDate
                    ? "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-350 dark:text-slate-600 cursor-not-allowed"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer text-slate-500 dark:text-slate-400"
                }`}
                title={selectedDate >= maxSelectableDate ? "오늘 이후 날짜는 조회 불가능합니다" : "다음 날짜로 이동"}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

          {/* Current Selection Presentation Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-5 border-t border-slate-150 dark:border-slate-700/80 gap-3">
            <div className="space-y-1">
              <div className="text-[11px] font-bold font-mono tracking-widest text-sky-500 uppercase">
                currently viewing
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
                {getKoreanDateFullString(selectedDate)}
              </h3>
            </div>

            {/* Quick alert indicator for Max Date lock */}
            {selectedDate === maxSelectableDate && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-650 dark:text-sky-400 text-xs font-semibold">
                <Sparkles className="w-4 h-4 animation-pulse" /> 최신 데이터 조회 완료 (어제 일자)
              </span>
            )}
          </div>
        </section>

        {/* Dashboard Visual Stats Row - Only shown when data is loaded and list is not empty */}
        {!loading && movieList.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Stat Card 1: Today's Champion film */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">박스오피스 1위</span>
                <h4 className="font-extrabold text-sky-600 dark:text-sky-400 text-sm md:text-base leading-snug truncate" title={top1Movie?.movieNm}>
                  {top1Movie ? top1Movie.movieNm : "데이터 없음"}
                </h4>
              </div>
            </motion.div>

            {/* Stat Card 2: Combined Audience of Upper Top Rankers */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Users2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 font-mono">탑10 합산 관객수</span>
                <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm md:text-base font-mono">
                  {totalAudienceOfToday.toLocaleString("ko-KR")}명
                </h4>
              </div>
            </motion.div>

            {/* Stat Card 3: Interactive Search filter */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="p-5 rounded-2xl bg-white dark:bg-[#1E293B] border border-slate-200/90 dark:border-slate-700/80 flex items-center gap-3 md:col-span-2 lg:col-span-1"
            >
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="차트 내 영화 이름 필터 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 bg-slate-55 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none focus:border-sky-500"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-sky-500 hover:text-sky-650 cursor-pointer"
                  >
                    초기화
                  </button>
                )}
              </div>
            </motion.div>

          </section>
        )}

        {/* Core Content Box Office Grid Area */}
        <section className="min-h-[40vh] relative">
          {loading ? (
            /* Loading Spinner Area */
            <div id="grid-loading" className="absolute inset-0 flex flex-col items-center justify-center gap-3 py-16">
              <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
              <p className="text-sm font-semibold text-gray-550 dark:text-gray-450 animate-pulse">
                영화전산서비스망 KOBIS에서 박스오피스 데이터를 조회하는 중...
              </p>
            </div>
          ) : error ? (
            /* Error Display Block */
            <div id="grid-error" className="flex flex-col items-center justify-center text-center p-10 max-w-lg mx-auto bg-rose-500/[0.02] dark:bg-rose-500/[0.01] rounded-3xl border border-rose-500/15 py-16">
              <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
              <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">데이터 조회를 완료하지 못했습니다</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => setSelectedDate(getYesterdayString())}
                className="px-5 py-2.5 rounded-xl bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 text-sm font-semibold shadow hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> 어제 날짜로 복원하기
              </button>
            </div>
          ) : filteredMovies.length === 0 ? (
            /* Empty Filter results */
            <div id="grid-empty" className="text-center py-24 border border-dashed border-gray-200 dark:border-gray-800 rounded-3xl">
              <Film className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h4 className="text-base font-bold text-gray-900 dark:text-gray-100">조회된 영화가 없습니다</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {searchQuery ? "입력하신 검색어에 해당하는 영화명이 없습니다." : "선택하신 날짜의 흥행 데이터가 없습니다."}
              </p>
            </div>
          ) : (
            /* Box Office Cards Grid Output */
            <motion.div
              id="boxoffice-cards-grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredMovies.map((movie) => (
                <MovieCard
                  key={movie.movieCd}
                  movie={movie}
                  onClick={(movieCd) => setSelectedMovieCd(movieCd)}
                />
              ))}
            </motion.div>
          )}
        </section>

      </main>

      {/* Styled Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/40 dark:bg-transparent py-8 mt-12 text-center text-xs text-gray-400 dark:text-gray-550 space-y-2">
        <p>전체 영화 정보 및 흥행 실적 수치는 영화진흥위원회 KOBIS Open API 연동 결과물입니다.</p>
        <p className="font-mono">Created dynamically with high security server-side proxy integration.</p>
      </footer>

      {/* Detail Slide/Modal Drawer */}
      <MovieDetailModal
        movieCd={selectedMovieCd}
        onClose={() => setSelectedMovieCd(null)}
      />

    </div>
  );
}
