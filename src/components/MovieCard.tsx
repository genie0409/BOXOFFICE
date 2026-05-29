import { Movie } from "../types";
import { motion } from "motion/react";
import { Users, Presentation, Calendar, Award, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MovieCardProps {
  key?: string;
  movie: Movie;
  onClick: (movieCd: string) => void;
}

export default function MovieCard({ movie, onClick }: MovieCardProps) {
  const formatNumber = (numStr: string) => {
    const num = parseInt(numStr, 10);
    return isNaN(num) ? "0" : num.toLocaleString("ko-KR");
  };

  const getRankBadgeStyles = (rank: string) => {
    switch (rank) {
      case "1":
        return "bg-gradient-to-r from-sky-500 to-blue-600 text-white font-extrabold shadow-lg shadow-sky-500/20";
      case "2":
        return "bg-sky-500/10 dark:bg-sky-500/25 border border-sky-500/30 text-sky-600 dark:text-sky-400 font-extrabold";
      case "3":
        return "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold";
      default:
        return "bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold border border-transparent";
    }
  };

  const renderRankChange = () => {
    if (movie.rankOldAndNew === "NEW") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500 text-white animate-pulse shadow-md shadow-sky-500/20">
          NEW
        </span>
      );
    }

    const inten = parseInt(movie.rankInten, 10);
    if (isNaN(inten) || inten === 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
          <Minus className="w-3.5 h-3.5" /> -
        </span>
      );
    }

    if (inten > 0) {
      return (
        <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-emerald-500 dark:text-emerald-400">
          ▲ {inten}
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-rose-500 dark:text-rose-400">
        ▼ {Math.abs(inten)}
      </span>
    );
  };

  // Top 3 gets special card effects
  const isTopRank = ["1", "2", "3"].includes(movie.rank);

  return (
    <motion.div
      id={`movie-card-${movie.movieCd}`}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      onClick={() => onClick(movie.movieCd)}
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer h-full flex flex-col justify-between p-6 bg-white dark:bg-[#1E293B] shadow-sm hover:shadow-xl dark:shadow-black/40 ${
        isTopRank
          ? "border-sky-500/25 dark:border-sky-500/30 ring-1 ring-sky-500/5 bg-gradient-to-b from-sky-500/[0.02] to-transparent dark:from-sky-500/[0.04]"
          : "border-slate-200/90 dark:border-slate-700/80"
      }`}
    >
      {/* Decorative colored glow ball for top ranks */}
      {isTopRank && (
        <div className={`absolute -right-12 -top-12 w-24 h-24 rounded-full opacity-10 filter blur-xl ${
          movie.rank === "1" ? "bg-sky-400" : movie.rank === "2" ? "bg-blue-400" : "bg-indigo-400"
        }`} />
      )}

      <div>
        {/* Top Header Card Info */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={`flex items-center justify-center w-8 h-8 rounded-lg text-sm tracking-tight shadow-sm md:w-9 md:h-9 ${getRankBadgeStyles(movie.rank)}`}>
              {movie.rank}
            </span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400">rank</span>
              {renderRankChange()}
            </div>
          </div>
          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded border border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-550">
            {movie.movieCd}
          </span>
        </div>

        {/* Movie Title */}
        <div className="mb-4">
          <h3 className="font-display font-bold text-[17px] md:text-lg text-slate-900 dark:text-white leading-tight tracking-tight group-hover:text-sky-500 dark:group-hover:text-sky-400 transition-colors">
            {movie.movieNm}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-405 dark:text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>개봉: {movie.openDt || "정보없음"}</span>
          </div>
        </div>
      </div>

      {/* Numerical Stats Dashboard details */}
      <div className="mt-auto space-y-3 pt-4 border-t border-slate-100 dark:border-slate-700/70">
        {/* Daily Audience */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            일일 관객수
          </span>
          <span className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-mono">
            {formatNumber(movie.audiCnt)}
          </span>
        </div>

        {/* Cumulative Audience */}
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            누적 관객수
          </span>
          <span className="text-xs font-medium text-sky-600 dark:text-sky-400 font-mono bg-sky-50 dark:bg-sky-500/10 px-2 py-0.5 rounded">
            {formatNumber(movie.audiAcc)}명
          </span>
        </div>

        {/* Sales Share Bar Chart simulation */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
              <Presentation className="w-3.5 h-3.5 text-slate-400" />
              매출 점유율
            </span>
            <span className="font-mono text-slate-900 dark:text-slate-250">
              {movie.salesShare}%
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, parseFloat(movie.salesShare) || 0)}%` }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className={`h-full rounded-full ${
                movie.rank === "1"
                  ? "bg-sky-500"
                  : "bg-slate-400 dark:bg-slate-600"
              }`}
            />
          </div>
        </div>

        {/* Screens and Shows */}
        <div className="text-[11px] text-slate-450 dark:text-slate-500 flex justify-between font-mono pt-1">
          <span>스크린 {formatNumber(movie.scrnCnt)}개</span>
          <span>상영 {formatNumber(movie.showCnt)}회</span>
        </div>
      </div>
    </motion.div>
  );
}
