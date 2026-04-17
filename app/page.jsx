"use client";
import { useEffect, useState } from "react";
import supabaseClient from "@/lib/supabase";

export default function Home() {
  const [pollData, setPollData] = useState(null);
  const [currentId, setCurrentId] = useState(1);
  const [highestId, setHighestId] = useState(null);
  const [curErr, setCurErr] = useState([]);
  const [isChossing, setIsChoosing] = useState(false);
  const [option1, setOption1] = useState(0)
  const [option2, setOption2] = useState(0)
  const [isCreateing, setIsCreating] = useState(false)
  const [createErr, setCreateErr] = useState({})

  const [input1, setInput1] = useState("")
  const [input2, setInput2] = useState("")

  useEffect(() => {
    setCurErr([])
    async function getInfo() {
      setInterval(async () => {
        const { data, error: errorId } = await supabaseClient.from("polls").select("id").limit(1).order("id", { ascending: false }).single();
        if (errorId) setCurErr(prev => [...prev, errorId] )
        if (data) setHighestId(data.id);
      }, 10000)
      
      const { data: poll, error} = await supabaseClient.from("polls").select("*").eq("id", currentId).single();
      if (error) return setCurErr(prev => [...prev, error] )
      setPollData(poll);
      setOption1(poll.num1)
      setOption2(poll.num2)
    }
    getInfo();
  }, []);


  const handleVote = async (pollId, option) => {
    try {
      setIsChoosing(true);
      if (!pollId || !option) return setCurErr(prev => [...prev, { message: "Invalid poll ID or option" }]);
      const { data, error } = await supabaseClient.rpc("updatevotes", { op: option, row_id: pollId });

      if (error) return setCurErr(prev => [...prev, error]);
      let nextId = null
      while (nextId === currentId || !nextId) {
        nextId = Math.floor(Math.random() * (highestId - 1)) + 1
      }
      const { data: poll, error: pollError } = await supabaseClient.from("polls").select("*").eq("id", nextId).single();
      setCurrentId(nextId)
      
      if (pollError) return setCurErr(prev => [...prev, pollError]);
      setTimeout(() => {
        setPollData(poll);
        setOption1(poll.num1)
        setOption2(poll.num2)
      }, 2000);
    } finally {
      setTimeout(() => setIsChoosing(false), 2000);
    }
  }

  return (
    <main className="flex w-screen h-screen items-center justify-center flex-col">
      <h1 className="text-4xl font-bold mb-auto pt-20">Would You Rather</h1>
      {pollData && (
        <div className="flex absolute w-screen items-center justify-center h-full gap-2 md:gap-8 lg:gap-16">
          <div className="option1 bg-red-700 w-4/9 h-1/2 rounded-lg flex flex-col items-center justify-center">
            <button className="text-2xl md:text-4xl lg:text-6xl cursor-pointer text-white w-full h-full" onClick={() => handleVote(pollData.id, 1)} disabled={isChossing}>{pollData.option1.toUpperCase()}</button>
            <p className="text-white lg:text-2xl">{isChossing &&  (option1 + option2 != 0) && `${option1} votes or ${ (option1 / (option1 + option2) * 100).toFixed(2)}%`}</p>
          </div>
          <div className="option2 bg-blue-700 w-4/9 h-1/2 rounded-lg flex flex-col items-center justify-center">
            <button className="text-2xl md:text-4xl lg:text-6xl cursor-pointer text-white w-full h-full" onClick={() => handleVote(pollData.id, 2)} disabled={isChossing}>{pollData.option2.toUpperCase()}</button>
            <p className="text-white lg:text-2xl">{isChossing && (option1 + option2 !== 0) && `${option2} votes or ${(option2 / (option1 + option2) * 100).toFixed(2)}%`}</p>
          </div>
        </div>
      )}
      <div className="z-9999 relative pb-20">
        <button className="text-2xl bg-gray-500 p-4 rounded-md text-white cursor-pointer" onClick={() => setIsCreating(true)}>Create</button>
      </div>
      <div className={`${isCreateing ? "flex" : "hidden"} create absolute w-100 h-fit pt-10 pb-20 bg-white border-black border-2 rounded-lg flex items-center justify-center flex-col gap-4`} style={{ display: isCreateing ? "flex" : "none" }}>
        <button className="text-4xl cursor-pointer" onClick={() => setIsCreating(false)} id="close">X</button>
        <h2 className="text-2xl font-bold">Create Polls</h2>
        <input value={input1} onChange={(e) => setInput1(e.target.value.toUpperCase())} type="text" placeholder="Option 1" className="border-2 border-gray-500 rounded-md p-2" id="option1Input" required />
        <input value={input2} onChange={(e) => setInput2(e.target.value.toUpperCase())} type="text" placeholder="Option 2" className="border-2 border-gray-500 rounded-md p-2" id="option2Input" required />
        {createErr && (
          <div className="absolute bottom-0 w-full pb-4">
            <p className="text-red-500 text-center">{createErr.message}</p>
          </div>
        )}
        <button className="text-white bg-green-500 p-2 rounded-md cursor-pointer" onClick={async () => {
          const option1 = input1
          const option2 = input2
          const {data, error} = await supabaseClient.from("polls").insert({ option1, option2 }).select().single();
          if (error) return setCreateErr(error);
          setCurrentId(data.id)
          setPollData(data);
          setOption1(0)
          setOption2(0)
          setIsCreating(false);
          }

        }>Create</button>
      </div>
      {curErr.length > 0 && (
        <div className="absolute bottom-0 w-screen p-4">
          {curErr && curErr.map((err, index) => (
            <p key={index} className="text-red-500 text-center">{err?.message}</p>
          ))}
        </div>
      )}
    </main>
  );
}