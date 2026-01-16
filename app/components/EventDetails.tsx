'use client'

export default function EventDetails() {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 space-y-8">
          <h2 className="text-4xl md:text-5xl font-serif text-center mb-12 text-gray-800">
            Event Details
          </h2>
          
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-serif text-gray-700 mb-2">Venue</h3>
              <p className="text-lg text-gray-600">
                [Add your venue address here]
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-serif text-gray-700 mb-2">Date</h3>
              <p className="text-lg text-gray-600">
                [Add your event date here]
              </p>
            </div>
            
            <div className="text-center">
              <h3 className="text-2xl font-serif text-gray-700 mb-2">Time</h3>
              <p className="text-lg text-gray-600">
                [Add your event time here]
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

