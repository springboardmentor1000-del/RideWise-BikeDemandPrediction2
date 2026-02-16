export default function Feature(){
    return <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl">
            {[
                { icon: Bike, title: 'Premium Fleet', desc: '50+ bikes available' },
                { icon: Zap, title: 'Instant Booking', desc: 'Book in seconds' },
                { icon: MapPin, title: 'Multiple Locations', desc: 'Across the city' },
            ].map((feature, idx) => (
            <div
              key={idx}
              className="group p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:border-orange-500/50"
            >
              <feature.icon className="w-12 h-12 text-orange-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>

    </div>
}