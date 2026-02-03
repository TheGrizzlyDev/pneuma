import React from 'react';
import { useNavigate } from 'react-router-dom';
import { seedTemplates } from '../seed';
import { computeNextOccurrence } from '../domain/reminders';
import { useStore } from '../ui/hooks/useStore';

export const HomePage: React.FC = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const lastLog = [...store.logs].sort((a, b) => b.completedAt.localeCompare(a.completedAt))[0];
  const lastRoutine = store.routines.find((routine) => routine.id === lastLog?.routineId);
  const nextReminder = store.reminders
    .filter((reminder) => reminder.enabled)
    .map((reminder) => ({
      reminder,
      next: computeNextOccurrence(reminder, new Date())
    }))
    .sort((a, b) => a.next.getTime() - b.next.getTime())[0];

  const greetingText = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Greeting Headline */}
      <div>
        <h1 className="text-[#112116] dark:text-white tracking-light text-[32px] font-bold leading-tight px-4 text-left pt-6">{greetingText()}</h1>
      </div>

      {/* Resume Card */}
      {lastRoutine && (
        <div className="px-4">
          <div className="flex flex-col items-stretch justify-start rounded-xl overflow-hidden shadow-sm bg-white dark:bg-[#1a3222] transition-transform hover:scale-[1.01] duration-300">
            <div className="flex flex-col md:flex-row">
              <div
                className="w-full md:w-1/3 bg-center bg-no-repeat bg-cover h-48 md:h-auto min-h-[160px]"
                style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuDxZ6c5s_zKIVBHCGh6HaMukmMInMSLJ5RGLFaGveO22uyHzQD05XIKUcwGjNv8PrNh4sK1gprFmsBfuS40JzhqgFTFJaeDWcyKP3zZx0iZDn6Uogq7F6d8Nd99h3-a32G7mQ__9KB27wO-xi5JUg3lrsib0UFd9kqnOwr1ecofXDgneMgsdaEa_L54OxmgBqocV7pknn4nbM4alnvXP3H0LhiOe6z7akBJgSx9WXJ5xxwMv_fL-jXW_4oOi9dmjcgMdTmE7QqYenM")` }}
              ></div>
              <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-primary text-sm">history</span>
                  <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-[#93c8a5]">Recent Session</span>
                </div>
                <p className="text-[#112116] dark:text-white text-xl font-bold leading-tight tracking-[-0.015em]">Resume: {lastRoutine.name}</p>
                <p className="text-gray-600 dark:text-[#93c8a5] text-base font-normal leading-normal mb-4">Last completed • {new Date(lastLog.completedAt).toLocaleDateString()}</p>
                <div className="flex items-end justify-between mt-auto">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                    <span className="capitalize">{lastRoutine.goalCategory} Focus</span>
                  </div>
                  <button
                    onClick={() => navigate(`/player?routineId=${lastRoutine.id}`)}
                    className="flex cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-6 bg-primary hover:bg-[#16cc52] text-[#112217] text-sm font-bold leading-normal transition-colors shadow-sm ml-auto sm:ml-0 w-full sm:w-auto"
                  >
                    <span className="truncate">Start again</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Start Section */}
      <div className="flex flex-col gap-2">
        <h2 className="text-[#112116] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 text-left pt-2">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {seedTemplates.slice(0, 3).map((template, idx) => {
            const backgrounds = [
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCwgJQIrQAE4PXR0vYnMxAC3WAGC0RsmpwkSOszwj-RR3Y7X7G0G9IEWfc1_G-6_b7EQBRHhOWDkAbs7aPVQr2GU8MIIB1FNLzw8pVYKT-hO8hUnxI-E0yjQktjay9vw5jV8rClLEiZtfUVdlwFGTCQqS6HWaNwpaYa2Zzqbj0yXFoAIwVCKc2suyb-427aUNroTnZyYQzzaZBKPMPD-8cDHLQjcwKtDKVYioVpZYIm2sOMw0kLXsmiv2-6qpdSDgMVEph1K1ce8Yk",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDYmbtqLxh3TDyk11CopUQo_6S4Ae_iEahDN6s68p82906e7L0nWmlpqICxykIjpmqY-2KfYmu66KjwFUf9K8xhEqHXhoQjClN7YDd2L7dieG_5xAogbEmXChGFdZJjStUCimP0d68nNX4in3s0BMlRVA7vrbHXtcgVYVsAUPtawBJZXK3wQts3SRiUyit5LlTWQlO6CEhFI0isCvako9iMfiTWnUY-_CD0h0-N_Ns5-8d4KvXkE9aQNNkGP9q03-LYLdGtYpC0tuI",
              "https://lh3.googleusercontent.com/aida-public/AB6AXuCGLTL9tdvtMTvWcciSoi1s5sQbmD8X0cpAXDzborlxwrRmOhWuTfV1kXqme_fcUgmcB4u9nNeS4tMmztt0qhtiSeshXS-t2sM1mqfRI_CboAuwPBn7pP73omsCzRUJHmfi_T3CCHJCgjacxWrNefs3PpNG3rOzeQ_0EWb7r8glra2tHr_8aYnxuhqJj9npB1Tiln4T0tdIrax4NraV3p0dWScb7fIVwGBKBCfyL9ReKIycDIPmiJi2bxQ_SE6Dsb9aEyKiv-4-VyI"
            ];
            const icons = ["monitor_heart", "thunderstorm", "bedtime"];
            return (
              <div
                key={template.id}
                onClick={() => navigate(`/player?templateId=${template.id}`)}
                className="group relative flex flex-col justify-end overflow-hidden rounded-xl aspect-video cursor-pointer shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url("${backgrounds[idx % backgrounds.length]}")` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="relative p-5 flex flex-col gap-1 z-10">
                  <span className="material-symbols-outlined text-white mb-1">{icons[idx % icons.length]}</span>
                  <p className="text-white text-lg font-bold leading-tight">{template.name}</p>
                  <p className="text-white/80 text-xs font-medium">{template.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Reminder Section */}
      <div className="px-4">
        <div className="bg-white dark:bg-[#1a3222] rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-gray-100 dark:border-none">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-primary text-2xl">notifications_active</span>
            </div>
            <div className="flex flex-col">
              <h3 className="text-[#112116] dark:text-white font-bold text-base">Daily Reminder</h3>
              <p className="text-gray-500 dark:text-[#93c8a5] text-sm">
                {nextReminder
                  ? `Next scheduled: ${nextReminder.next.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'No reminders scheduled'}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/reminders')}
            className="flex items-center gap-2 bg-gray-50 dark:bg-black/20 px-3 py-2 rounded-lg self-start sm:self-center hover:bg-gray-100 dark:hover:bg-black/30 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400 text-[18px]">info</span>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manage reminders</p>
          </button>
        </div>
      </div>
    </div>
  );
};
