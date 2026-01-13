import { useState } from "react";
import Navbar from "../components/Navbar";
import SideNavbar from "../components/Sidebar";
import StationMap from "../components/StationMap";
import StationInfo from "../components/StationInfo";
import NetworkSummary from "../components/NetworkSummary";
import RideWiseBackground from "../background/NewBackground";

export default function MapPage() 
{
    const [selectedStation, setSelectedStation] = useState(null);
    return (
        <div className="h-screen w-full text-white">
          <RideWiseBackground>
            <Navbar />

            {/* PAGE LAYOUT */}
            <div className="flex h-[calc(100vh-40px)]">
              {/* SIDEBAR */}
              <aside className="w-64 h-full flex-shrink-0">
                <SideNavbar />
              </aside>

              {/* MAIN CONTENT (SCROLLABLE) */}
              <main className="flex-1 px-6 pt-24 pb-6 space-y-6 overflow-y-auto scrollbar-hide w-250">

                {/* HEADER */}
                <header className="text-center">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                    Real-Time Station Tracking
                  </h1>
                  <p className="text-gray-400 mt-2">
                    AI Powered Bike Rental Prediction – Live station monitoring
                  </p>
                </header>

                {/* SEARCH BAR */}
                <div className="max-w-3xl mx-auto">
                  <input
                    type="text"
                    placeholder="Search for any location worldwide..."
                    className="w-full px-6 py-4 rounded-xl
                      bg-white/5 border border-white/10
                      backdrop-blur-md text-sm
                      focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
                  />
                </div>

                {/* MAP + INFO SECTION */}
                <section className="flex w-full gap-6  h-[calc(100vh-160px)]">

                  {/* MAP (BIGGER & FULL HEIGHT) */}
                  <div className="w-[60%]">
                    <div className="h-full min-h-[650px] rounded-2xl overflow-hidden
                      bg-white/10 backdrop-blur-xl
                      border border-white/20 shadow-lg">
                      <StationMap onSelectStation={setSelectedStation} />
                    </div>
                  </div>

                  {/* RIGHT PANEL (SCROLLABLE INSIDE IF NEEDED) */}
                  <div className="flex-[30%] flex flex-col gap-4
                    overflow-y-auto scrollbar-hide pr-1 ">

                    {/* STATION INFO */}
                    {selectedStation ? (
                      <StationInfo station={selectedStation} />
                    ) : (
                      <div className="rounded-2xl border border-dashed border-white/20
                        bg-white/5 p-6 text-center text-gray-300">
                        Select a station on the map
                      </div>
                    )}

                    {/* NETWORK SUMMARY */}
                    <NetworkSummary />
                  </div>

                </section>
              </main>
            </div>
          </RideWiseBackground>
        </div>
    );
}
