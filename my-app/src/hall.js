import React, {useEffect} from "react";
import { url1 } from "./urls";
import KroosterContentExtractor from "./kroos";

const Hall = () => {
    useEffect(() => {
    document.title = "Trophy Case";
  }, []);
  return (
    <div className="flex h-screen bg-dark-gray-500">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-black rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-white mb-6">
                Honkai Star Rail: The Herta
              </h2>
              <img
                src={'https://i.imgur.com/VN9xrxn.png'}
                alt="z"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
              <p className="text-sm text-white font-semibold mb-6 mt-3">
                UID: 806261798
              </p>
              <p className="text-xs text-white mb-1">
                Card Credit: starrailoptimizer.github.io
              </p>
              <p className="text-xs text-white mt-2">
                Global Top 10 THerta{" "}
                <a
                  href="https://seeleland.com/leaderboards/lb/1401/E4S1_23037RMC_121/1"
                  className="text-xs text-blue-600 no-underline mb-4 mt-1 hover:text-blue-800"
                >
                  {" "}
                  (Seele land)
                </a>
              </p>
            </div>
            <div className="bg-black rounded-xl shadow-sm p-6 h-[800px] flex flex-col">
              <h2 className="text-lg font-semibold text-white mb-6">
                Honkai Star Rail
              </h2>
              <img
                src={"https://i.imgur.com/hC54aBJ.png"}
                alt="b"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />{" "}
              <img
                src={"https://i.imgur.com/s33j9eK.png"}
                alt="b"
                style={{
                  width: "100%",
                  height: "auto",
                }}
              />
              <a
                href="https://enka.network/hsr/806261798/"
                className="text-xs text-blue-600 no-underline mb-1 mt-1 hover:text-blue-800"
              >
                Enka HSR Profile
              </a>
            </div>
            <div className="bg-black rounded-xl shadow-sm p-6 h-[800px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">
                  Arknights Roster
                </h2>
              </div>
              <div className="flex-1 rounded-lg overflow-hidden border border-gray-200">
                <KroosterContentExtractor />
              </div>
              <p className="text-xs text-white mb-4 mt-6">
                Credit: krooster.com
              </p>
            </div>
            <div className="bg-black rounded-xl shadow-sm p-6 h-[1000px] flex flex-col items-center col-span-full">
              <h2 className="text-xl font-semibold text-white mb-6">
                Other Gacha games{" "}
              </h2>
              <h2 className="text-lg font-semibold text-white mb-1">
                Zenless Zone Zero{" "}
              </h2>
              <img
                src={"https://i.imgur.com/QtpMdZp.png"}
                alt="a"
                style={{
                  width: "50%",
                  height: "auto",
                }}
              />
              <a
                href="https://enka.network/zzz/1001222267/"
                className="text-xs text-blue-600 no-underline mb-4 mt-1 hover:text-blue-800"
              >
                Enka ZZZ Profile
              </a>
              <h2 className="text-lg font-semibold text-white mb-1">
                Genshin Impact{" "}
              </h2>
              <img
                src={"https://i.imgur.com/mVxAW0K.png"}
                alt="a"
                style={{
                  width: "50%",
                  height: "auto",
                }}
              />
              <a
                href="https://enka.network/u/600707587/"
                className="text-xs text-blue-600 no-underline mb-4 mt-1 hover:text-blue-800"
              >
                Enka GI Profile
              </a>
            </div>
          </div>
          <h2 className="text-xl font-semibold text-white text-center mb-6 mt-8">
  Misc trophies
</h2>
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 mt-8 justify-items-center mx-auto max-w-fit">
  <div className="bg-black rounded-xl shadow-sm p-10 hover:shadow-md transition-shadow flex justify-center items-center">
    <img
      src={"https://i.imgur.com/goh4VoX.png"}
      alt="a"
      style={{
        width: "auto",
        height: "auto",
      }}
    />
  </div>
  <div className="bg-black rounded-xl shadow-sm p-10 hover:shadow-md transition-shadow flex justify-center items-center">
    <img
      src={"https://i.imgur.com/xleYVU3.png"}
      alt="a"
      style={{
        width: "auto",
        height: "auto",
      }}
    />
  </div>
  <div className="bg-black rounded-xl shadow-sm p-10 hover:shadow-md transition-shadow flex justify-center items-center">
    <img
      src={"https://i.imgur.com/phjrlSW.jpeg"}
      alt="a"
      style={{
        width: "auto",
        height: "auto",
      }}
    />
  </div>
</div>
        </main>
      </div>
    </div>
  );
};

export default Hall;
