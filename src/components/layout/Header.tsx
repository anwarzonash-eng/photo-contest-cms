//header
import React from 'react'
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import Link from 'next/link';

const Header: React.FC = () => {
    const router = useRouter();

    const navigationItems = [
        { href: "/weekly-topten", label: "Weekly Top Ten" },
        { href: "/past-events", label: "Past Events" },
        { href: "/events", label: "Events" },
        { href: "/activity-callout", label: "Activity Page Callout" },
        { href: "/activity", label: "Notification" },
    ];
    let LogOutHandler = () => {
        Cookies.remove("PhotoContestCMS.");
        router.push("/login");
    };
    return (

        <header className="header-area header-fixed" >
            <div className="container-fluid">
                <div className="row">
                    <div className="col">
                        <div className="header_wrap d-flex flex-wrap gap-3 align-items-center justify-content-between">
                            <div className="site_logo">
                                <Link href={'/'} className="logo">
                                    <img src="./assets/img/logo.png" alt="LOGO" />
                                </Link>
                            </div>
                            <div className="header_right">
                                <button className="btn login" onClick={LogOutHandler}>Log out</button>
                                <div className="menu_bar">
                                    <a >
                                        <img src="./assets/img/icons/menu-bar.svg" alt="Menu Bar" />
                                    </a>
                                    {/* Hamburger Menu */}
                                    <nav className="side_menu" style={{ backgroundColor: "white" }}>
                                        <ul>
                                            {navigationItems?.map((item, index) => (
                                                <li key={index}>
                                                    <Link href={item.href}>{item.label}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header >

    )
}

export default Header
