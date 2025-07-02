import {Navigate, Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomaPage.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import SettingsPage from "./pages/SettingsPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import {useAuthStore} from "./store/useAuthStore.ts";
import {useEffect} from "react";
import {Loader} from "lucide-react";
import {Toaster} from "react-hot-toast";

const App = () => {

    const {authUser,checkAuth,isCheckingAuth}=useAuthStore();
    useEffect(()=>{
        checkAuth()
    },[checkAuth]);

    console.log({authUser});

    if(isCheckingAuth && !authUser) return(
        <div className="flex items-center justify-center h-screen">
            <Loader className="size-10 animate-spin"/>
        </div>
    )

    return(
        <div>

            <Navbar/>

            <Routes>
                {/*can make protected route component*/}
                <Route path='/' element={authUser?<HomePage/>:<Navigate to="/login"/> }/>
                <Route path='/signup' element={!authUser?<SignupPage/>:<Navigate to="/"/>}/>
                <Route path='/login' element={!authUser?<LoginPage/>:<Navigate to="/"/>}/>
                <Route path='/settings' element={<SettingsPage/>}/>
                <Route path='/profile' element={authUser?<ProfilePage/>:<Navigate to="/login"/>}/>
            </Routes>
            <Toaster/>
        </div>

    )
}
export default App;