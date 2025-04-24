import { PropsWithChildren, useState } from 'react'
import { CgMenuLeftAlt } from 'react-icons/cg'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [drop, setDrop] = useState(false)
  const toDrop = () => {
    setDrop(!drop)
  }

  return (
    <>
      <nav className="bg-zinc-500 h-15 ">
        <div className="flex p-3 items-center justify-between  lg:gap-20">
          <Link to="/">
            <div className="text-3xl font-bold">LOGO</div>
          </Link>
          <div
            className={`${drop ? 'top-12' : '-top-full'} absolute left-0  bg-zinc-500 w-full flex 
          flex-col items-center gap-2 font-bold
          lg:flex lg:static lg:flex-row lg:justify-between`}
          >
            <ul
              className="flex flex-col items-center gap-2 
            lg:flex-row lg:gap-15"
            >
              <li>
                <Link to="about" onClick={toDrop}>
                  <div className=" hover:text-amber-300 duration-400">About</div>
                </Link>
              </li>
              <li>
                <Link to="allprojects" onClick={toDrop}>
                  <div className=" hover:text-amber-300 duration-400">Project</div>
                </Link>
              </li>
              <li>
                <Link to="contract" onClick={toDrop}>
                  <NavbarLink>Contract</NavbarLink>
                </Link>
              </li>
            </ul>
            <div
              className="flex flex-col items-center gap-2  pb-3
            lg:flex-row lg:pr-4 lg:gap-10 lg:pb-0"
            >
              <a className=" hover:text-amber-300 duration-400">Register</a>
              <a className=" hover:text-amber-300 duration-400">Login</a>
            </div>
          </div>
          <div className="text-3xl lg:hidden">
            <CgMenuLeftAlt onClick={toDrop} />
          </div>
        </div>
      </nav>
    </>
  )
}
const NavbarLink = (props: PropsWithChildren) => {
  return <div className="cursor-pointer hover:text-blue-700 duration-400">{props.children}</div>
}

export default Navbar
