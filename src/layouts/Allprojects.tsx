import { Link } from 'react-router-dom'
interface ProjectList {
  name: string
  link: string
}

const defaultData: ProjectList[] = [
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
    <div className="bg-amber-100">
      <ul className="p-2">
        {defaultData.map((e, index) => {
          return (
            <Link key={index} to={e.link}>
              <li className="text-3xl p-2 hover:bg-amber-400">
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
