import { Link } from 'react-router-dom'
interface ProjectList {
  name: string
  link: string
}

export const projectList: ProjectList[] = [
  {
    name: 'MeowList',
    link: '/p1',
  },
  {
    name: 'Todo',
    link: '/p2',
  },
  {
    name: 'MyFriends',
    link: '/p3',
  },
  {
    name: 'Quiz Meaow',
    link: '/p4',
  },
  {
    name: 'Random Card',
    link: '/p5',
  },
  {
    name: 'Game Omama',
    link: '/p6',
  },
  {
    name: '9 gea',
    link: '/p7',
  },
  {
    name: 'Check Bill',
    link: '/p8',
  },
]

const Allprojects = () => {
  return (
    <div className="flex h-full justify-center bg-gray-100">
      <ul className="mt-5 h-fit rounded-lg bg-white p-4 shadow-lg">
        {projectList.map((e, index) => {
          return (
            <Link
              key={index}
              to={e.link}
              className="block transition duration-300 ease-in-out hover:bg-gray-200"
            >
              <li className="border-b p-4 text-2xl font-semibold text-gray-800 last:border-none">
                Project {index + 1} : {e.name}
              </li>
            </Link>
          )
        })}
      </ul>
    </div>
  )
}

export default Allprojects
