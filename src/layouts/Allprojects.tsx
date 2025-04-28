import { Link } from 'react-router-dom'
interface Projects {
  name: string
  link: string
}

const defaultData: Projects[] = [
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
