import { useState } from 'react'
import { CgMenuLeftAlt } from 'react-icons/cg'

const Navbar = () => {
  const [drop, setDrop] = useState(false)
  const toDrop = () => {
    setDrop(!drop)
  }

  return (
    <>
      <nav className="bg-zinc-500 h-12">
        <div className="flex p-1 items-center justify-between px-3 lg:gap-20">
          <a href="#" className="text-3xl font-bold">
            LOGO
          </a>
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
                <a href="#">About</a>
              </li>
              <li>
                <a href="#">Project</a>
              </li>
              <li>
                <a href="#">Contract</a>
              </li>
            </ul>
            <div
              className="flex flex-col gap-2  
            lg:flex-row lg:pr-4 lg:gap-10"
            >
              <button>Register</button>
              <button>Login</button>
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

export default Navbar
