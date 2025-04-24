import { Link } from 'react-router-dom'

const Allprojects = () => {
  return (
    <div className="bg-amber-100">
      <ul className="p-2">
        <Link to="/p1">
          <li className="text-3xl p-2 hover:bg-amber-400">Project 1 : MeowList</li>
        </Link>
        <Link to="/p2">
          <li className="text-3xl p-2 hover:bg-amber-400">Project 2 : Todo</li>
        </Link>
      </ul>
    </div>
  )
}

export default Allprojects
