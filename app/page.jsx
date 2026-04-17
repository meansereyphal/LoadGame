"use client";
import { useEffect, useState, useCallback } from "react";
import supabaseClient from "@/lib/supabase";

export default function Home() {
  const [pollData, setPollData] = useState<any>(null);
  const [currentId, setCurrentId] = useState(1);
  const [highestId, setHighestId] = useState<number | null>(null);
  const [curErr, setCurErr] = useState<any[]>([]);
  const [isChoosing, setIsChoosing] = useState(false);
  const [option1Votes, setOption1Votes] = useState(0);
  const [option2Votes, setOption2Votes] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [createErr, setCreateErr] = useState<any>(null);

  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  // 1. Monitor the total number of polls (runs every 10s)
  useEffect(() => {
    async function getHighestId() {
      const { data, error } = await supabaseClient
        .from("polls")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching max ID:", error);
      } else if (data) {
        setHighestId(data.id);
      }
    }

    getHighestId();
    const interval = setInterval(getHighestId, 10000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch specific poll data whenever currentId changes
  useEffect(() => {
    async function fetchCurrentPoll() {
      const { data, error } = await supabaseClient
        .from("polls")
        .select("*")
        .eq("id", currentId)
        .single();

      if (error) {
        setCurErr((prev) => [...prev, error]);
      } else {
        setPollData(data);
        setOption1Votes(data.num1 || 0);
        setOption2Votes(data.num2 || 0);
      }
    }
    fetchCurrentPoll();
  }, [currentId]);

  const handleVote = async (pollId: number, option: number) => {
    if (isChoosing) return;
    setIsChoosing(true);

    try {
      // 1. Register Vote
      const { error } = await supabaseClient.rpc("updatevotes", { 
        op: option, 
        row_id: pollId 
      });

      if (error) throw error;

      // 2. Show results for 2 seconds
      setTimeout(() => {
        // 3. Pick a new random ID
        if (highestId && highestId > 1) {
          let nextId = currentId;
          // Safety loop to find a different ID
          for (let i = 0; i < 5; i++) {
            const random = Math.floor(Math.random() * highestId) + 1;
            if (random !== currentId) {
              nextId = random;
              break;
            }
          }
          setCurrentId(nextId);
        }
        setIsChoosing(false);
      }, 2000);

    } catch (err: any) {
      setCurErr((prev) => [...prev, err]);
      setIsChoosing(false);
    }
  };

  const handleCreate = async () => {
    if (!input1 || !input2) return;
    
    const { data, error } = await supabaseClient
      .from("polls")
      .insert({ option1: input1, option2: input2, num1: 0, num2: 0 })
      .select()
      .single();

    if (error) {
      setCreateErr(error);
    } else {
      setCurrentId(data.id);
      setInput1("");
      setInput2("");
      setIsCreating(false);
      setCreateErr(null);
    }
  };

  const totalVotes = option1Votes + option2Votes;

  return (
    <main className="relative flex flex-col items-center justify-center w-screen h-screen overflow-hidden bg-gray-900 text-white">
      <h1 className="text-5xl font-black mt-12 mb-auto uppercase tracking-tighter italic">
        Would You Rather
      </h1>

      {pollData && (
        <div className="flex absolute inset-0 items-center justify-center gap-4 px-4 md:gap-8 lg:gap-12 h-full">
          {/* Option 1 */}
          <div className="relative group w-1/2 h-2/3 md:h-1/2">
            <button
              onClick={() => handleVote(pollData.id, 1)}
              disabled={isChoosing}
              className="w-full h-full bg-red-600 hover:bg-red-500 transition-all rounded-2xl flex flex-col items-center justify-center p-6 disabled:opacity-80"
            >
              <span className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase text-center">
                {pollData.option1}
              </span>
              {isChoosing && (
                <p className="mt-4 text-xl md:text-2xl font-mono">
                  {((option1Votes / (totalVotes || 1)) * 100).toFixed(1)}%
                </p>
              )}
            </button>
          </div>

          {/* Option 2 */}
          <div className="relative group w-1/2 h-2/3 md:h-1/2">
            <button
              onClick={() => handleVote(pollData.id, 2)}
              disabled={isChoosing}
              className="w-full h-full bg-blue-600 hover:bg-blue-500 transition-all rounded-2xl flex flex-col items-center justify-center p-6 disabled:opacity-80"
            >
              <span className="text-2xl md:text-4xl lg:text-5xl font-bold uppercase text-center">
                {pollData.option2}
              </span>
              {isChoosing && (
                <p className="mt-4 text-xl md:text-2xl font-mono">
                  {((option2Votes / (totalVotes || 1)) * 100).toFixed(1)}%
                </p>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      <div className="pb-20 z-10">
        <button
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          onClick={() => setIsCreating(true)}
        >
          SUBMIT YOUR OWN
        </button>
      </div>

      {/* Create Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white text-black w-full max-w-md p-8 rounded-3xl flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black uppercase">Create a Poll</h2>
              <button onClick={() => setIsCreating(false)} className="text-2xl font-bold">✕</button>
            </div>
            
            <input
              value={input1}
              onChange={(e) => setInput1(e.target.value.toUpperCase())}
              placeholder="OPTION 1"
              className="border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-red-500 outline-none transition-colors"
            />
            <input
              value={input2}
              onChange={(e) => setInput2(e.target.value.toUpperCase())}
              placeholder="OPTION 2"
              className="border-2 border-gray-200 rounded-xl p-4 text-lg focus:border-blue-500 outline-none transition-colors"
            />

            {createErr && <p className="text-red-500 text-sm">{createErr.message}</p>}

            <button
              onClick={handleCreate}
              className="bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors"
            >
              PUBLISH POLL
            </button>
          </div>
        </div>
      )}

      {/* Error Toasts */}
      <div className="fixed bottom-4 left-4 flex flex-col gap-2">
        {curErr.slice(-3).map((err, i) => (
          <div key={i} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
            {err.message}
          </div>
        ))}
      </div>
    </main>
  );
}