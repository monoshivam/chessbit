import { useState, useCallback, useRef } from "react";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import Image from "next/image";

const monthMap = {
  1: "Jan",
  2: "Feb",
  3: "Mar",
  4: "Apr",
  5: "May",
  6: "Jun",
  7: "Jul",
  8: "Aug",
  9: "Sep",
  10: "Oct",
  11: "Nov",
  12: "Dec",
};

export default function ChessComInterface({
  loadPGN,
}: {
  loadPGN: (pgn: string) => void;
}) {
  const [inputValue, setInputValue] = useState("");
  const username = useRef<string | null>(null);
  const [userInfo, setUserInfo] = useState(null);

  const isDisabled = inputValue.trim() === "";

  const fetchData = async () => {
    username.current = inputValue.trim();

    const currentDate = new Date();
    const dateArray = [
      currentDate.getFullYear(),
      (currentDate.getMonth() + 1).toString().padStart(2, "0"),
      currentDate.getDate().toString().padStart(2, "0"),
    ];

    console.log(username.current);
    const res = await fetch(
      `https://api.chess.com/pub/player/${username.current}/games/${dateArray[0]}/${dateArray[1]}`,
      {
        method: "GET",
      },
    );
    // if (!res.ok) {
    //   throw new Error(`API error! status: ${res.status}`);
    // }
    const tempUserInfo = await res.json();
    setUserInfo(tempUserInfo);
    console.log(tempUserInfo);
  };

  const renderGameData = useCallback(() => {
    const games = [];

    for (let i = userInfo.games.length - 1; i >= 0; i--) {
      const tempPgn = userInfo.games[i].pgn;
      const date = [
        parseInt(tempPgn.match(/\[Date "(\d{4})\.(\d{2})\.(\d{2})"\]/)[1]),
        parseInt(tempPgn.match(/\[Date "(\d{4})\.(\d{2})\.(\d{2})"\]/)[2]),
        parseInt(tempPgn.match(/\[Date "(\d{4})\.(\d{2})\.(\d{2})"\]/)[3]),
      ];

      const whiteName = userInfo.games[i].white.username;
      const whiteRating = userInfo.games[i].white.rating;
      const blackName = userInfo.games[i].black.username;
      const blackRating = userInfo.games[i].black.rating;

      let gameEndState: string;
      if (username.current == userInfo.games[i].white.username) {
        gameEndState =
          userInfo.games[i].white.result == "win"
            ? "win"
            : userInfo.games[i].white.result == "checkmated" ||
                userInfo.games[i].white.result == "timeout" ||
                userInfo.games[i].white.result == "resigned" ||
                userInfo.games[i].white.result == "lose" ||
                userInfo.games[i].white.result == "abandoned"
              ? "loss"
              : "draw";
      } else {
        gameEndState =
          userInfo.games[i].black.result == "win"
            ? "win"
            : userInfo.games[i].black.result == "checkmated" ||
                userInfo.games[i].black.result == "timeout" ||
                userInfo.games[i].black.result == "resigned" ||
                userInfo.games[i].black.result == "lose" ||
                userInfo.games[i].black.result == "abandoned"
              ? "loss"
              : "draw";
      }
      console.log(gameEndState);

      games.push(
        <div
          key={`game-${games.length - i}`}
          className="grid grid-cols-[auto_auto_1fr] gap-2 bg-neutral-700 p-2 rounded-md place-items-end mb-2"
          onClick={() => {
            loadPGN(userInfo.games[i].pgn);
          }}
        >
          <div className="h-full flex flex-col items-center justify-around ">
            <div className="h-4 aspect-square bg-white rounded-xs border-1 border-neutral-500"></div>
            <div className="h-4 aspect-square bg-black rounded-xs border-1 border-neutral-500"></div>
          </div>
          <div className="flex flex-col justify-around">
            <label className="font-bold text-sm">{`${whiteName} (${whiteRating})`}</label>
            <label className="font-bold text-sm">{`${blackName} (${blackRating})`}</label>
          </div>
          <div className="w-full h-full flex justify-end mr-2 gap-4 items-center">
            <label className="font-medium text-xs text-center text-">{`${date[2]} ${monthMap[date[1]]} ${date[0]}`}</label>
            <div className="size-5 overflow-hidden">
              <Image
                src={`/gameStats/${gameEndState}.png`}
                alt="gamestat"
                width={20}
                height={20}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>,
      );
    }
    return games;
  }, [userInfo, loadPGN]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex gap-3">
        <input
          type="text"
          className="bg-[#1c1917] border-2 flex-1 rounded-sm px-2 min-w-0"
          placeholder="Enter your chess.com username"
          onChange={(e) => setInputValue(e.target.value)}
        ></input>
        <Button
          disabled={isDisabled}
          className={
            isDisabled
              ? "opacity-50 cursor-not-allowed bg-lime-500 font-bold"
              : "bg-lime-500 font-bold hover:bg-lime-400"
          }
          onClick={fetchData}
        >
          Get Games
        </Button>
      </div>
      <ScrollArea
        className={`${userInfo && userInfo.code != 0 ? "h-[calc(30vh)] lg:h-[calc(100vh-35.5rem)]" : ""} px-2 py-2 rounded-md bg-[#1c1917] border-1`}
      >
        {!userInfo ? (
          <label>Search the username!</label>
        ) : userInfo.code == 0 ? (
          <label className="w-full mx-auto">{`User ${username.current} not found!`}</label>
        ) : (
          renderGameData()
        )}
      </ScrollArea>
    </div>
  );
}
