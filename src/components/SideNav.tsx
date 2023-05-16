import { signIn, signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import React from 'react'

const SideNav = () => {
    const session = useSession();

    //only available when logged in
    const user = session.data?.user;

    return <nav className="sticky top-0 px-2 py-4">
        <ul className="flex flex-col whitespace-nowrap items-start gap-2">
            <li><Link href="/">Home</Link></li>
            {!!user && <li><Link href={`/profiles/${user.id}`}>Profile</Link></li>}
            {/* e- not pass in signin, signout */}
            {!!user && <li><button onClick={() => void signOut()}>Logout</button></li>}
            {!user && <li><button onClick={() => void signIn()}>Login</button></li>}
        </ul>
    </nav>
}

export default SideNav
