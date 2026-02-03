import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../ui/hooks/useStore';

const goalLabels: Record<string, string> = {
  all: 'All',
  bp: 'Lower BP',
  relax: 'Relax',
  focus: 'Focus',
  sleep: 'Sleep',
  panic: 'Panic'
};

const categoryColors: Record<string, string> = {
  bp: 'text-red-400',
  relax: 'text-primary',
  focus: 'text-primary',
  sleep: 'text-blue-400',
  panic: 'text-orange-400'
};

export const ExercisesPage: React.FC = () => {
  const { store } = useStore();
  const navigate = useNavigate();
  const [activeGoal, setActiveGoal] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const exercises = store.exercises.filter((exercise) => {
    const matchesGoal = activeGoal === 'all' || exercise.goalCategory === activeGoal;
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesGoal && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-2 pb-10">
      {/* Page Heading & Search */}
      <div className="flex flex-col md:flex-row justify-between gap-4 p-4">
        <div className="flex min-w-72 flex-col gap-3">
          <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">Exercise Library</h1>
          <p className="text-[#93c8a5] text-base font-normal leading-normal">Browse breathing patterns designed to lower blood pressure and reduce stress.</p>
        </div>
        <div className="flex items-center">
            <div className="flex w-full md:w-64 items-stretch rounded-xl h-10 group bg-[#244730] focus-within:bg-[#2f5a3d] transition-colors overflow-hidden">
                <div className="text-[#93c8a5] flex items-center justify-center pl-4">
                    <span className="material-symbols-outlined text-[20px]">search</span>
                </div>
                <input
                    className="w-full bg-transparent text-white focus:outline-0 border-none px-4 pl-2 text-base font-normal"
                    placeholder="Search exercises..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Chips / Categories */}
      <div className="flex gap-3 p-4 flex-wrap overflow-x-auto pb-6">
        {Object.entries(goalLabels).map(([key, label]) => (
          <div
            key={key}
            onClick={() => setActiveGoal(key)}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-xl px-4 cursor-pointer transition-all ${
              activeGoal === key
                ? 'bg-primary text-[#112217] font-bold'
                : 'bg-[#244730] text-white hover:bg-white/10'
            }`}
          >
            <p className="text-sm leading-normal">{label}</p>
          </div>
        ))}
      </div>

      {/* Cards List */}
      <div className="flex flex-col gap-4 p-4">
        {exercises.map((exercise, idx) => {
            const exerciseImages = [
                "https://lh3.googleusercontent.com/aida-public/AB6AXuD9hVpXIxhcG_6TDZ8QyMrh-vVnuN54GHRhaaadr6MnhEgAqT_taNewyER5ZFriUZt1m709c9XiatwA-2zDHkbEH4S8fE6tFbOhh1Sr7cI7Bb0Mxz5tCsYA7wFkfXmXiT_qgGz0Ix1Tj70AoaBm2qI5IXuHapsvWx0we6ZPKX_mn_2hvobWN4yoT4otRIxbv4dXlNANBs2XRZU_pM6SVv7418vYugwHzBud40AHfagGXdMYiwMEvUGVcPhnFt3BBInPFBlEoY2zuFA",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuDOLbiMiO3YURCTiLLYrc5MitnVexJKVktguRU70wRz1xCl2wnxdhhXtzQEZ7DEjVXv5jkRT3LhXmqSRVyoqOmv_BVtBFEvpzde351KVDK1VaYHhjFY9AzWAZiHPiKMMtrzaM_CYc3lTv0YHWt-_xlF0Sdp49_XbDPgIXpft49e4ZzsfAxpmcd1miWDFOZ1tnRHwKHmc9vErrD0X_Qd3jI5at9umvWm8-MBC-IO0FPUYNEl1GyoYZcTCkzGpwVp0fDjyDgt2vwhe8Q",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBW54iBicbI9dFZSJ2Kj9JCFO7SSvhrESyR4CE81zVTLpd3fqd3mI6mDVE0RexrF8Vt3pSGwMR4jKjZ-0kLjJOo-4AAlik8_oY2tPaDvvQ0YRy2onVHxDreO78hoXttkAmd-pQoWkw7NcPQv_zZrjh3jdyVvM02NOXgNWghjLZ75uvaPgH4sFSEC1o1V1w3fklxuZZjXsjQ3OMHmBb-cMmsZEVSuP4vva2-sYjkmOEcrOEhsk_fP7fusfN99ytu3Gpl3cWSW1d9-Hw",
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBVe1fNy5cYXbOLLAt23U8l3eGNfLeVtxYD0EhT6aX6xB7jRvOmreq3bYjKcNjt8ZsWyxFIE5dJIU76JNLVNTEC_4htTRHcV5pNXE5_i6njf8aPJqHTQIc2MguENao3bkbHQYuhshIYnk6D1pw4xrrinC2-xfPZFZ1Arc0vxsgiUWqxyrXisxavaYh4IC3uM3I8ALNpSiaRwHW0-B83Gkn_I4f6oVFzXSGvzphydzVIto8LmBmndLfXEcXLwZ8QWpVvdihRgpMge20"
            ];
            return (
              <div key={exercise.id} className="flex flex-col-reverse md:flex-row items-stretch justify-between gap-4 rounded-2xl bg-[#1a3222] p-4 shadow-sm hover:bg-[#1e3a28] transition-colors border border-transparent hover:border-[#244730] group">
                <div className="flex flex-[2_2_0px] flex-col justify-between gap-4">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#244730] ${categoryColors[exercise.goalCategory] ?? 'text-primary'}`}>
                        {goalLabels[exercise.goalCategory]}
                      </span>
                    </div>
                    <p className="text-white text-xl font-bold leading-tight group-hover:text-primary transition-colors">{exercise.name}</p>
                    <p className="text-[#93c8a5] text-sm font-normal leading-normal">{exercise.description}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/player?exerciseId=${exercise.id}`)}
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 flex-row-reverse bg-[#244730] hover:bg-primary group/btn text-white hover:text-black pr-2 gap-2 text-sm font-bold leading-normal w-fit transition-all duration-300"
                  >
                    <span className="material-symbols-outlined text-[20px] transition-transform group-hover/btn:translate-x-0.5">play_arrow</span>
                    <span className="truncate">Start</span>
                  </button>
                </div>
                <div
                  className="w-full md:w-1/3 min-h-[160px] bg-center bg-no-repeat bg-cover rounded-xl"
                  style={{ backgroundImage: `url("${exerciseImages[idx % exerciseImages.length]}")` }}
                >
                  <div className="w-full h-full bg-black/20 rounded-xl"></div>
                </div>
              </div>
            );
        })}
      </div>
    </div>
  );
};
