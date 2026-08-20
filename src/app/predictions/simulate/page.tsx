"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { tournaments, Team, Group } from "@/data/tournaments";

interface GroupSelection {
  first: Team | null;
  second: Team | null;
}

function SimulateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("tournament");
  
  const tournament = tournaments.find((t) => t.id === tournamentId);

  // Group Stage state
  const [groupSelections, setGroupSelections] = useState<Record<string, GroupSelection>>({});
  
  // Knockout Bracket state
  // R16 (8 matches, 16 teams) -> QF (4 matches) -> SF (2 matches) -> F (1 match) -> Champion
  const [r16Matches, setR16Matches] = useState<[Team | null, Team | null][]>(Array(8).fill([null, null]));
  const [qfMatches, setQfMatches] = useState<[Team | null, Team | null][]>(Array(4).fill([null, null]));
  const [sfMatches, setSfMatches] = useState<[Team | null, Team | null][]>(Array(2).fill([null, null]));
  const [fMatch, setFMatch] = useState<[Team | null, Team | null]>([null, null]);
  const [champion, setChampion] = useState<Team | null>(null);

  const [step, setStep] = useState<"group" | "knockout">("group");
  const [activeRoundTab, setActiveRoundTab] = useState<"r16" | "qf" | "sf" | "f">("r16");

  // Initialize group selections
  useEffect(() => {
    if (tournament) {
      const initial: Record<string, GroupSelection> = {};
      tournament.groups.forEach((g) => {
        initial[g.name] = { first: null, second: null };
      });
      setGroupSelections(initial);
    }
  }, [tournament]);

  if (!tournament) {
    return (
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 font-bold mb-4">Tournament not found.</p>
          <button onClick={() => router.push("/predictions")} className="text-primary hover:underline">
            Go back to tournaments
          </button>
        </div>
      </div>
    );
  }

  // Handle clicking a team in the group stage
  const handleGroupTeamClick = (groupName: string, team: Team) => {
    const current = groupSelections[groupName];
    if (!current) return;

    let updated = { ...current };

    if (current.first?.code === team.code) {
      // Remove from 1st
      updated.first = null;
    } else if (current.second?.code === team.code) {
      // Remove from 2nd
      updated.second = null;
    } else if (!current.first) {
      // Set as 1st
      updated.first = team;
    } else if (!current.second) {
      // Set as 2nd
      updated.second = team;
    } else {
      // Both selected, shift 1st to 2nd and set new as 1st
      updated.second = current.first;
      updated.first = team;
    }

    setGroupSelections((prev) => ({
      ...prev,
      [groupName]: updated
    }));
  };

  const isGroupStageComplete = () => {
    return Object.values(groupSelections).every((sel) => sel.first !== null && sel.second !== null);
  };

  // Generate Knockout round matches from group stage selections
  const handleProceedToKnockouts = () => {
    if (!isGroupStageComplete()) return;

    const pairs: [Team | null, Team | null][] = [];
    
    if (tournamentId === "world-cup-2026") {
      // 8 groups: A, B, C, D, E, F, G, H
      // 16 teams: 1st & 2nd from each
      // Standard matchups (A vs B, C vs D, E vs F, G vs H)
      const g = groupSelections;
      const groupKeys = tournament.groups.map(g => g.name); // ["Group A", "Group B", ...]
      
      pairs.push([g[groupKeys[0]].first, g[groupKeys[1]].second]); // 1A vs 2B
      pairs.push([g[groupKeys[2]].first, g[groupKeys[3]].second]); // 1C vs 2D
      pairs.push([g[groupKeys[4]].first, g[groupKeys[5]].second]); // 1E vs 2F
      pairs.push([g[groupKeys[6]].first, g[groupKeys[7]].second]); // 1G vs 2H
      pairs.push([g[groupKeys[1]].first, g[groupKeys[0]].second]); // 1B vs 2A
      pairs.push([g[groupKeys[3]].first, g[groupKeys[2]].second]); // 1D vs 2C
      pairs.push([g[groupKeys[5]].first, g[groupKeys[4]].second]); // 1F vs 2E
      pairs.push([g[groupKeys[7]].first, g[groupKeys[6]].second]); // 1H vs 2G
    } else {
      // euro-2024 has 6 groups: A, B, C, D, E, F
      // 12 teams + 4 wildcards (3rd place from A, B, C, D)
      const g = groupSelections;
      const groupKeys = tournament.groups.map(g => g.name); // ["Group A", "Group B", ...]
      
      // Helper to find 3rd place (first unselected team)
      const getThirdPlace = (groupName: string): Team => {
        const groupObj = tournament.groups.find(group => group.name === groupName);
        const sel = g[groupName];
        if (!groupObj || !sel) return { name: "Wildcard", code: "WLD", flag: "🏳️" };
        const unselected = groupObj.teams.find(
          t => t.code !== sel.first?.code && t.code !== sel.second?.code
        );
        return unselected || { name: "Wildcard", code: "WLD", flag: "🏳️" };
      };

      const wA = getThirdPlace(groupKeys[0]); // 3rd Group A
      const wB = getThirdPlace(groupKeys[1]); // 3rd Group B
      const wC = getThirdPlace(groupKeys[2]); // 3rd Group C
      const wD = getThirdPlace(groupKeys[3]); // 3rd Group D

      pairs.push([g[groupKeys[0]].first, wC]); // 1A vs 3C
      pairs.push([g[groupKeys[1]].first, g[groupKeys[5]].second]); // 1B vs 2F
      pairs.push([g[groupKeys[2]].first, wD]); // 1C vs 3D
      pairs.push([g[groupKeys[3]].first, g[groupKeys[4]].second]); // 1D vs 2E
      pairs.push([g[groupKeys[1]].second, g[groupKeys[0]].second]); // 2B vs 2A
      pairs.push([g[groupKeys[4]].first, wA]); // 1E vs 3A
      pairs.push([g[groupKeys[5]].first, wB]); // 1F vs 3B
      pairs.push([g[groupKeys[2]].second, g[groupKeys[3]].second]); // 2C vs 2D
    }

    setR16Matches(pairs);
    setQfMatches(Array(4).fill([null, null]));
    setSfMatches(Array(2).fill([null, null]));
    setFMatch([null, null]);
    setChampion(null);
    setActiveRoundTab("r16");
    setStep("knockout");
  };

  // Handle advancing a team in the bracket
  const handleKnockoutWinner = (stage: "r16" | "qf" | "sf" | "f", matchIdx: number, winner: Team) => {
    if (stage === "r16") {
      const nextQfIdx = Math.floor(matchIdx / 2);
      const isTeamA = matchIdx % 2 === 0;

      const newQf = [...qfMatches];
      const currentMatch = [...newQf[nextQfIdx]];
      currentMatch[isTeamA ? 0 : 1] = winner;
      newQf[nextQfIdx] = currentMatch as [Team | null, Team | null];
      setQfMatches(newQf);

      // Clear subsequent dependent rounds if a branch changes
      clearDependentRounds("qf", nextQfIdx);
    } else if (stage === "qf") {
      const nextSfIdx = Math.floor(matchIdx / 2);
      const isTeamA = matchIdx % 2 === 0;

      const newSf = [...sfMatches];
      const currentMatch = [...newSf[nextSfIdx]];
      currentMatch[isTeamA ? 0 : 1] = winner;
      newSf[nextSfIdx] = currentMatch as [Team | null, Team | null];
      setSfMatches(newSf);

      clearDependentRounds("sf", nextSfIdx);
    } else if (stage === "sf") {
      const isTeamA = matchIdx === 0;

      const newF = [...fMatch];
      newF[isTeamA ? 0 : 1] = winner;
      setFMatch(newF as [Team | null, Team | null]);

      setChampion(null);
    } else if (stage === "f") {
      setChampion(winner);
    }
  };

  const clearDependentRounds = (fromStage: "qf" | "sf", changedMatchIdx: number) => {
    if (fromStage === "qf") {
      // Clear corresponding SF match
      const nextSfIdx = Math.floor(changedMatchIdx / 2);
      const isTeamA = changedMatchIdx % 2 === 0;
      setSfMatches((prev) => {
        const updated = [...prev];
        updated[nextSfIdx] = [...updated[nextSfIdx]] as [Team | null, Team | null];
        updated[nextSfIdx][isTeamA ? 0 : 1] = null;
        return updated;
      });

      // Clear F
      setFMatch([null, null]);
      setChampion(null);
    } else if (fromStage === "sf") {
      const isTeamA = changedMatchIdx === 0;
      setFMatch((prev) => {
        const updated = [...prev];
        updated[isTeamA ? 0 : 1] = null;
        return updated as [Team | null, Team | null];
      });
      setChampion(null);
    }
  };

  const handleFinishPrediction = () => {
    if (!champion) return;
    
    // Save state in base64 parameters for query share
    const state = {
      t: tournamentId,
      cName: champion.name,
      cCode: champion.code,
      cFlag: champion.flag,
      f1Name: fMatch[0]?.name || "",
      f1Flag: fMatch[0]?.flag || "",
      f2Name: fMatch[1]?.name || "",
      f2Flag: fMatch[1]?.flag || ""
    };
    
    const serialized = btoa(encodeURIComponent(JSON.stringify(state)));
    router.push(`/predictions/result?data=${serialized}`);
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-12 flex flex-col gap-10">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant/30 pb-6">
        <div>
          <p className="font-mono text-label-sm text-primary mb-2 uppercase tracking-widest">
            {tournament.name} Predictor
          </p>
          <h1 className="font-display text-4xl text-on-surface font-bold tracking-tight">
            {step === "group" ? "Group Stage Selection" : "Knockout Stage Bracket"}
          </h1>
          <p className="font-body text-body-lg text-on-surface-variant mt-2 max-w-2xl">
            {step === "group"
              ? "Select the 1st and 2nd place advancing teams from each group to build your knockout stage."
              : "Choose the winner of each matchup to progress them through the rounds to the championship."}
          </p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          {step === "knockout" && (
            <button
              onClick={() => setStep("group")}
              className="flex-1 md:flex-none px-6 py-3 rounded border border-outline-variant text-on-surface hover:border-primary hover:text-primary font-mono text-label-sm uppercase tracking-wider transition-colors cursor-pointer"
            >
              Back to Groups
            </button>
          )}
          <button
            onClick={() => {
              if (step === "group") {
                const initial: Record<string, GroupSelection> = {};
                tournament.groups.forEach((g) => {
                  initial[g.name] = { first: null, second: null };
                });
                setGroupSelections(initial);
              } else {
                handleProceedToKnockouts();
              }
            }}
            className="flex-1 md:flex-none px-6 py-3 rounded border border-primary text-primary font-mono text-label-sm uppercase tracking-wider hover:bg-primary/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-sm">restart_alt</span>
            Reset
          </button>
        </div>
      </header>

      {/* STEP 1: GROUP STAGE */}
      {step === "group" && (
        <section className="flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {tournament.groups.map((group) => {
              const selection = groupSelections[group.name] || { first: null, second: null };
              const isComplete = selection.first !== null && selection.second !== null;

              return (
                <div key={group.name} className="bg-surface-container-low border border-outline-variant/60 rounded-xl p-5 hover:border-primary/30 transition-all duration-300">
                  <h3 className="font-mono text-label-sm text-on-surface-variant uppercase tracking-widest mb-4 flex justify-between items-center border-b border-outline-variant/30 pb-2">
                    {group.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isComplete ? "bg-primary/10 text-primary border border-primary/20" : "bg-surface-container-high text-on-surface-variant/70"
                    }`}>
                      {isComplete ? "✓ Ready" : `${(selection.first ? 1 : 0) + (selection.second ? 1 : 0)}/2 Advancing`}
                    </span>
                  </h3>

                  <div className="flex flex-col gap-2">
                    {group.teams.map((team) => {
                      const isFirst = selection.first?.code === team.code;
                      const isSecond = selection.second?.code === team.code;
                      const isSelected = isFirst || isSecond;

                      return (
                        <button
                          key={team.code}
                          onClick={() => handleGroupTeamClick(group.name, team)}
                          className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all duration-300 cursor-pointer ${
                            isFirst
                              ? "bg-primary/15 border-primary text-primary shadow-[0_0_10px_rgba(212,175,55,0.05)]"
                              : isSecond
                              ? "bg-primary/5 border-primary/40 text-primary-container"
                              : "bg-surface border-outline-variant/40 hover:border-outline text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{team.flag}</span>
                            <span className="font-body text-body-md font-semibold">{team.name}</span>
                          </div>
                          
                          {/* Selection indicator badges */}
                          {isSelected && (
                            <span className="font-mono text-[10px] uppercase font-bold border border-primary/30 px-2 py-0.5 rounded bg-surface">
                              {isFirst ? "1st" : "2nd"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Proceed Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleProceedToKnockouts}
              disabled={!isGroupStageComplete()}
              className="px-8 py-4 bg-primary-container text-on-primary font-title text-title-md font-bold uppercase rounded-lg hover:bg-primary transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.2)]"
            >
              Proceed to Knockouts
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: KNOCKOUT BRACKET */}
      {step === "knockout" && (
        <section className="w-full select-none pb-6">
          {/* Mobile Tabs */}
          <div className="flex md:hidden justify-between border-b border-outline-variant/30 mb-6 bg-surface-container-low p-2 rounded-lg gap-2">
            <button
              onClick={() => setActiveRoundTab("r16")}
              className={`flex-1 py-2 text-center text-xs font-mono rounded transition-colors ${
                activeRoundTab === "r16" ? "bg-primary text-black font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              R16
            </button>
            <button
              onClick={() => setActiveRoundTab("qf")}
              className={`flex-1 py-2 text-center text-xs font-mono rounded transition-colors ${
                activeRoundTab === "qf" ? "bg-primary text-black font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              QF
            </button>
            <button
              onClick={() => setActiveRoundTab("sf")}
              className={`flex-1 py-2 text-center text-xs font-mono rounded transition-colors ${
                activeRoundTab === "sf" ? "bg-primary text-black font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              SF
            </button>
            <button
              onClick={() => setActiveRoundTab("f")}
              className={`flex-1 py-2 text-center text-xs font-mono rounded transition-colors ${
                activeRoundTab === "f" ? "bg-primary text-black font-bold" : "text-on-surface-variant hover:text-primary"
              }`}
            >
              Final
            </button>
          </div>

          <div className="w-full overflow-x-auto bracket-container">
            <div className="md:min-w-[1200px] w-full flex flex-col md:flex-row justify-between items-stretch gap-6 md:gap-10 p-4 relative">
              
              {/* ROUND OF 16 COLUMN */}
              <div className={`flex flex-col justify-around gap-6 w-full md:w-72 ${activeRoundTab === "r16" ? "flex" : "hidden md:flex"}`}>
                <h3 className="font-mono text-label-sm text-primary uppercase text-center tracking-widest border-b border-outline-variant/20 pb-2">
                  Round of 16
                </h3>
                {r16Matches.map((match, idx) => (
                  <div key={`r16-${idx}`} className="bg-surface-container border border-outline-variant/40 rounded-lg p-3 flex flex-col gap-2 relative z-10 shadow-md">
                    {match.map((team, tIdx) => {
                      const hasAdvanded = qfMatches[Math.floor(idx / 2)].some((t) => t?.code === team?.code);
                      return (
                        <button
                          key={tIdx}
                          disabled={!team}
                          onClick={() => team && handleKnockoutWinner("r16", idx, team)}
                          className={`w-full flex items-center justify-between p-2.5 rounded border text-left transition-all duration-300 cursor-pointer ${
                            !team
                              ? "bg-surface-container-lowest/20 border-outline-variant/10 text-on-surface-variant/30"
                              : hasAdvanded
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-surface border-outline-variant/20 hover:border-outline text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{team?.flag || "🏳️"}</span>
                            <span className="font-body text-body-md font-medium truncate max-w-[140px]">
                              {team?.name || "TBD"}
                            </span>
                          </div>
                          {hasAdvanded && (
                            <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* QUARTER-FINALS COLUMN */}
              <div className={`flex flex-col justify-around gap-6 w-full md:w-72 ${activeRoundTab === "qf" ? "flex" : "hidden md:flex"}`}>
                <h3 className="font-mono text-label-sm text-primary uppercase text-center tracking-widest border-b border-outline-variant/20 pb-2">
                  Quarter-Finals
                </h3>
                {qfMatches.map((match, idx) => (
                  <div key={`qf-${idx}`} className="bg-surface-container border border-outline-variant/40 rounded-lg p-3 flex flex-col gap-2 relative z-10 shadow-md">
                    {match.map((team, tIdx) => {
                      const hasAdvanced = sfMatches[Math.floor(idx / 2)].some((t) => t?.code === team?.code);
                      return (
                        <button
                          key={tIdx}
                          disabled={!team}
                          onClick={() => team && handleKnockoutWinner("qf", idx, team)}
                          className={`w-full flex items-center justify-between p-2.5 rounded border text-left transition-all duration-300 cursor-pointer ${
                            !team
                              ? "bg-surface-container-lowest/20 border-outline-variant/10 text-on-surface-variant/30"
                              : hasAdvanced
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-surface border-outline-variant/20 hover:border-outline text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{team?.flag || "🏳️"}</span>
                            <span className="font-body text-body-md font-medium truncate max-w-[140px]">
                              {team?.name || "TBD"}
                            </span>
                          </div>
                          {hasAdvanced && (
                            <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* SEMI-FINALS COLUMN */}
              <div className={`flex flex-col justify-around gap-6 w-full md:w-72 ${activeRoundTab === "sf" ? "flex" : "hidden md:flex"}`}>
                <h3 className="font-mono text-label-sm text-primary uppercase text-center tracking-widest border-b border-outline-variant/20 pb-2">
                  Semi-Finals
                </h3>
                {sfMatches.map((match, idx) => (
                  <div key={`sf-${idx}`} className="bg-surface-container border border-outline-variant/40 rounded-lg p-3 flex flex-col gap-2 relative z-10 shadow-md">
                    {match.map((team, tIdx) => {
                      const hasAdvanced = fMatch[idx]?.code === team?.code;
                      return (
                        <button
                          key={tIdx}
                          disabled={!team}
                          onClick={() => team && handleKnockoutWinner("sf", idx, team)}
                          className={`w-full flex items-center justify-between p-2.5 rounded border text-left transition-all duration-300 cursor-pointer ${
                            !team
                              ? "bg-surface-container-lowest/20 border-outline-variant/10 text-on-surface-variant/30"
                              : hasAdvanced
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-surface border-outline-variant/20 hover:border-outline text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{team?.flag || "🏳️"}</span>
                            <span className="font-body text-body-md font-medium truncate max-w-[140px]">
                              {team?.name || "TBD"}
                            </span>
                          </div>
                          {hasAdvanced && (
                            <span className="material-symbols-outlined text-sm text-primary">check_circle</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* FINAL & CHAMPION COLUMN */}
              <div className={`flex flex-col justify-center gap-8 w-full md:w-72 ${activeRoundTab === "f" ? "flex" : "hidden md:flex"}`}>
                {/* FINAL MATCH CARD */}
                <div>
                  <h3 className="font-mono text-label-sm text-primary uppercase text-center tracking-widest border-b border-outline-variant/20 pb-2 mb-6">
                    Final Match
                  </h3>
                  <div className="bg-surface-container border border-outline-variant/40 rounded-lg p-4 flex flex-col gap-3 shadow-lg">
                    {fMatch.map((team, tIdx) => {
                      const isChampion = champion?.code === team?.code;
                      return (
                        <button
                          key={tIdx}
                          disabled={!team}
                          onClick={() => team && handleKnockoutWinner("f", 0, team)}
                          className={`w-full flex items-center justify-between p-3 rounded border text-left transition-all duration-300 cursor-pointer ${
                            !team
                              ? "bg-surface-container-lowest/20 border-outline-variant/10 text-on-surface-variant/30"
                              : isChampion
                              ? "bg-primary/20 border-primary text-primary"
                              : "bg-surface border-outline-variant/20 hover:border-outline text-on-surface"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{team?.flag || "🏳️"}</span>
                            <span className="font-body text-body-md font-semibold truncate max-w-[140px]">
                              {team?.name || "TBD"}
                            </span>
                          </div>
                          {isChampion && (
                            <span className="material-symbols-outlined text-primary">emoji_events</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* CHAMPION PODIUM */}
                {champion && (
                  <div className="bg-surface border-2 border-primary/50 rounded-xl p-5 flex flex-col items-center justify-center text-center shadow-[0_0_20px_rgba(212,175,55,0.15)] animate-bounce mt-4">
                    <span className="material-symbols-outlined text-primary text-5xl mb-2" style={{ fontVariationSettings: "'FILL' 1" }}>
                      emoji_events
                    </span>
                    <span className="font-mono text-[10px] text-primary uppercase tracking-widest mb-1">
                      Champion
                    </span>
                    <span className="text-4xl mb-1">{champion.flag}</span>
                    <h4 className="font-display text-title-md font-bold text-on-surface">
                      {champion.name}
                    </h4>
                    
                    <button
                      onClick={handleFinishPrediction}
                      className="mt-6 w-full py-3 bg-primary-container text-on-primary font-title text-label-sm font-bold uppercase rounded-lg hover:bg-primary transition-all duration-300 cursor-pointer"
                    >
                      Finish Simulation
                    </button>
                  </div>
                )}
              </div>

            </div>
          </div>
        </section>
      )}
    </main>
  );
}

export default function SimulatePage() {
  return (
    <Suspense fallback={<div className="flex-grow flex items-center justify-center font-mono text-label-sm">Loading Simulator...</div>}>
      <SimulateContent />
    </Suspense>
  );
}
