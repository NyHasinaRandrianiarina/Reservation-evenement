import Navbar from './Navbar';
import Footer from './Footer';
import { Outlet } from 'react-router-dom';
import { CartDrawer } from '@/components/cart/CartDrawer';

const Layout = () => {
    return (
        <>
            <Navbar />
            <main className="grow">
                <Outlet />
            </main>
            <Footer />
            <CartDrawer />
        </>
    )
};

export default Layout;
