const people = [
  {
    name: 'Rahul Raj',
    role: 'Co-Founder / CEO',
    imageUrl:
      'https://e7.pngegg.com/pngimages/96/298/png-clipart-shin-chan-illustration-crayon-shin-chan-shinnosuke-nohara-drawing-donald-duck-animated-film-donald-duck-comics-child-thumbnail.png',
  },
  {
    name: 'Niteesh Chaudhary ',
    role: 'Co-Founder / CTO',
    imageUrl:
      'https://upload.wikimedia.org/wikipedia/en/b/bd/Doraemon_character.png',
  },
  // More people...
]

export default function OurLeaders() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto grid  gap-x-8 gap-y-10 px-6 lg:px-8 xl:grid-rows-1">
        <div className="max-w-screen">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Meet our leadership</h2>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            At the heart of our organization is a commitment to innovation, collaboration, and excellence. Our leaders
            bring years of experience and a shared vision to drive the company forward, fostering a culture where creativity
            thrives, and every team member is empowered to reach their full potential.
          </p>
        </div>
        <ul role="list" className="grid gap-x-8 gap-y-12 sm:grid-cols-2 sm:gap-y-16 xl:col-span-1">
          {people.map((person) => (
            <li key={person.name}>
              <div className="flex items-center gap-x-6">
                {/* <img className="h-16 w-16 rounded-full" src={person.imageUrl} alt="" /> */}
                <div>
                  <h3 className="text-base font-semibold leading-7 tracking-tight text-gray-900">{person.name}</h3>
                  <p className="text-sm font-semibold leading-6 text-indigo-600">{person.role}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
