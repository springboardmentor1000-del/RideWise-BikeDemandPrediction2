export default function Button({ text }) {
  return (
    <button
      className="
        flex items-center justify-center w-40 h-15
        text-[20px] md:text-[24px]
        font-sans text-white
        cursor-pointer select-none
        rounded-lg
        bg-[linear-gradient(144deg,#AF40FF,#5B42F3_50%,#00DDEB)]
        shadow-[0_15px_30px_-5px_rgba(151,65,252,0.2)]
        hover:outline-none active:outline-none
      "
    >
      <span
        className="w-40 h-15
          px-6 py-4
          rounded-md
          bg-[rgb(5,6,45)]
          transition-all duration-300
          hover:bg-transparent
        "
      >
        {text}
      </span>
    </button>
  );
}


{/* <button className="group px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-full border-2 border-white/20 transition-all duration-300 hover:bg-white/20 hover:scale-105 hover:shadow-xl flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Find Location
          </button> */}


        //   <button className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50">
        //     <span className="relative z-10 flex items-center gap-2">
        //       <Bike className="w-5 h-5" />
        //       Browse Bikes
        //     </span>
        //     <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        //   </button>