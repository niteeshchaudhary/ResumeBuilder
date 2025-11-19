import { akriti_jain, hridya_sharma, hrishikesh } from "../assets/Images"

const posts = [
  {
    "id": 1,
    "title": "Impressive Resume Grading System",
    "href": "#",
    "description": "The resume grader provided insightful feedback on structure and content. The suggestions improved my resume significantly, and the template creator was easy to use.",
    "date": "Oct 20, 2024",
    "datetime": "2024-10-20",
    "category": {
      "title": "Resume Grader",
      "href": "#"
    },
    "reviewer": {
      "name": "Hrishikesh",
      "role": "Senior Software Engineer",
      "href": "#",
      "imageUrl": hrishikesh
    }
  },
  {
    "id": 2,
    "title": "Effective and Easy to Use",
    "href": "#",
    "description": "I found the resume creator intuitive and helpful. The resume grading feature gave me actionable tips that helped me land more interviews.",
    "date": "Oct 18, 2024",
    "datetime": "2024-10-18",
    "category": {
      "title": "Resume Creator",
      "href": "#"
    },
    "reviewer": {
      "name": "Hridya sharma",
      "role": "HR Manager",
      "href": "#",
      "imageUrl": hridya_sharma
    }
  },
  {
    "id": 3,
    "title": "Highly Recommend for Job Seekers",
    "href": "#",
    "description": "The grader's feedback was spot on, and the templates were professional. I was able to create a standout resume in just a few minutes.",
    "date": "Oct 16, 2024",
    "datetime": "2024-10-16",
    "category": {
      "title": "Resume Grader and Creator",
      "href": "#"
    },
    "reviewer": {
      "name": "Akriti Jain",
      "role": "Marketing Specialist",
      "href": "#",
      "imageUrl": akriti_jain
    }
  }
]


export default function Reviews() {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto  px-6 lg:px-8">
        <div className="mx-auto max-w-1xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">What our Clients say?</h2>
          {/* <p className="mt-2 text-lg leading-8 text-gray-600">
              Learn how to grow your business with our expert advice.
            </p> */}
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-gray-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.datetime} className="text-gray-500">
                  {post.date}
                </time>
                <a
                  href={post.category.href}
                  className="relative z-10 rounded-full bg-gray-50 px-3 py-1.5 font-medium text-gray-600 hover:bg-gray-100"
                >
                  {post.category.title}
                </a>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-gray-900 group-hover:text-gray-600">
                  <a href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </a>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-gray-600">{post.description}</p>
              </div>
              <div className="relative mt-8 flex items-center gap-x-4">
                <img src={post.reviewer.imageUrl} alt="" className="h-10 w-10 rounded-full bg-gray-50" />
                <div className="text-sm leading-6">
                  <p className="font-semibold text-gray-900">
                    {/* <a href={post.reviewer.href}> */}
                    <span className="absolute inset-0" />
                    {post.reviewer.name}
                    {/* </a> */}
                  </p>
                  <p className="text-gray-600">{post.reviewer.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}
